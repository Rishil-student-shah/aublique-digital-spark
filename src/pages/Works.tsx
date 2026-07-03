import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Layers, Code, Shield, Cpu, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import FloatingShapes from "@/components/FloatingShapes";
import AnimatedSection from "@/components/AnimatedSection";
import Seo from "@/components/Seo";
import { cn } from "@/lib/utils";
import localProjects from "@/data/projects.json";

interface Project {
  id: string;
  title: string;
  slug: string;
  category: string;
  client_name: string;
  technologies: string[];
  short_description: string;
  full_description: string;
  challenges: string;
  solution: string;
  thumbnail: string;
  is_featured: boolean;
  completion_date: string;
  published: boolean;
  display_order: number;
  timeline: Array<{ phase: string; date: string; description: string }>;
  results: Array<{ label: string; value: string; icon: string }>;
  testimonial_text?: string;
  testimonial_author?: string;
  testimonial_role?: string;
  gallery?: Array<{ url: string; caption: string; type: string }>;
}

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  delay?: number;
}

const StatCounter = ({ label, value, suffix = "", delay = 0 }: StatCardProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) return;
    
    // Smooth count-up animation
    const duration = 1.5; // seconds
    const totalFrames = 60 * duration;
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      // Ease out quad formula
      const easedProgress = progress * (2 - progress);
      const current = Math.floor(easedProgress * end);
      
      setCount(current);

      if (frame >= totalFrames) {
        setCount(end);
        clearInterval(timer);
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="bg-card border border-border p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden group">
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-lime/5 rounded-full blur-xl group-hover:bg-lime/10 transition-all duration-500" />
      <span className="text-3xl md:text-4xl font-extrabold text-lime glow-lime">
        {count}
        {suffix}
      </span>
      <span className="text-xs md:text-sm text-muted-foreground mt-2 font-medium uppercase tracking-wider">{label}</span>
    </div>
  );
};

const CATEGORIES = [
  { id: "all", label: "All Works" },
  { id: "web-development", label: "Web Development" },
  { id: "whatsapp-automation", label: "WhatsApp Automation" },
  { id: "crm-erp", label: "CRM / ERP" },
  { id: "cyber-security", label: "Cyber Security" },
];

const Works = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  
  // Aggregate stats from projects database
  const [stats, setStats] = useState({
    projectsCount: 0,
    clientsCount: 0,
    categoriesCount: 0,
  });

  useEffect(() => {
    const loadWorks = async () => {
      try {
        setLoading(true);
        // Load local projects directly from imported JSON
        const allProjects = (localProjects as Project[]).filter((p) => p.published);
        setProjects(allProjects);
        setFilteredProjects(allProjects);

        // Gather unique clients and distinct technologies (expertises)
        const clients = new Set(allProjects.map((p) => p.client_name).filter(Boolean));
        const expertises = new Set(allProjects.flatMap((p) => p.technologies || []).map(t => t.trim().toLowerCase()).filter(Boolean));

        setStats({
          projectsCount: allProjects.length,
          clientsCount: clients.size || 2,
          categoriesCount: expertises.size || 6,
        });
      } catch (err) {
        console.error("Error loading projects:", err);
      } finally {
        setLoading(false);
      }
    };
    loadWorks();
  }, []);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId === "all") {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(projects.filter((p) => p.category === categoryId));
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "web-development":
        return <Code className="w-3.5 h-3.5" />;
      case "cyber-security":
        return <Shield className="w-3.5 h-3.5" />;
      case "whatsapp-automation":
        return <MessageSquare className="w-3.5 h-3.5" />;
      default:
        return <Cpu className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="min-h-screen pt-16 relative">
      <Seo
        title="Our Works | Aublique Case Studies"
        description="Explore projects Aublique has shipped — secure web apps, mobile apps, and enterprise systems built for measurable outcomes."
        path="/works"
      />
      
      {/* Hero Section */}
      <section className="relative py-28 overflow-hidden">
        <FloatingShapes />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-black text-lime glow-lime mb-6 tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            OUR WORKS
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            We deploy secure engineering, optimized architectures, and high-performance interfaces to build robust platforms.
          </motion.p>

          {/* Stats counters */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
            <StatCounter label="Projects Shipped" value={stats.projectsCount || 2} />
            <StatCounter label="Clients" value={stats.clientsCount || 2} />
            <StatCounter label="Expertises" value={stats.categoriesCount || 6} />
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="py-6 border-y border-border bg-card/10 backdrop-blur-sm sticky top-24 z-30">
        <div className="container mx-auto px-4 flex justify-start md:justify-center overflow-x-auto scrollbar-none">
          <div className="flex gap-2.5 p-1.5 bg-muted/30 rounded-full border border-border/80 flex-nowrap w-max md:w-auto">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={cn(
                    "relative px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 whitespace-nowrap",
                    active ? "text-black" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="activeCategoryPill"
                      className="absolute inset-0 bg-lime rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-2 border-lime border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-border rounded-3xl bg-card/20 max-w-lg mx-auto">
              <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-semibold">No case studies found</p>
              <p className="text-sm text-muted-foreground mt-1 px-4">No projects have been published in this category yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((p, i) => {
                const isFeatured = p.is_featured;
                return (
                  <AnimatedSection
                    key={p.id}
                    delay={i * 0.05}
                    className={cn(
                      "group",
                      isFeatured ? "md:col-span-2 lg:col-span-2" : ""
                    )}
                  >
                    <Link to={`/works/${p.slug}`}>
                      <motion.div
                        whileHover={{ y: -6, boxShadow: "0 10px 40px hsl(262 100% 66% / 0.15)" }}
                        className={cn(
                          "bg-card border border-border rounded-3xl overflow-hidden cursor-pointer h-full flex flex-col relative",
                          isFeatured ? "border-lime/30 shadow-[0_0_20px_hsl(75_100%_50%/0.05)]" : ""
                        )}
                      >
                        {/* Featured badge */}
                        {isFeatured && (
                          <div className="absolute top-4 left-4 z-10 flex items-center gap-1 bg-lime text-black font-bold uppercase tracking-wider text-[10px] px-3 py-1.5 rounded-full shadow-lg">
                            <Star className="w-3 h-3 fill-black" />
                            Featured Project
                          </div>
                        )}

                        {/* Image overlay */}
                        <div className={cn(
                          "relative bg-muted overflow-hidden flex-shrink-0",
                          isFeatured ? "aspect-[21/9]" : "aspect-[16/10]"
                        )}>
                          {p.thumbnail ? (
                            <img
                              src={p.thumbnail}
                              alt={p.title}
                              className={cn(
                                "w-full h-full transition-all duration-700 group-hover:scale-105",
                                p.category === "whatsapp-automation" ? "object-contain bg-black/40 p-4" : "object-cover"
                              )}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted/60">
                              <Layers className="w-10 h-10" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                            <Button variant="lime" className="rounded-full flex items-center gap-2 text-xs font-bold uppercase tracking-wider py-5 px-8">
                              View Case Study <ArrowRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-6 flex-1 flex flex-col justify-between">
                          <div className="space-y-3">
                            {/* Category and Client */}
                            <div className="flex items-center justify-between text-xs">
                              <span className="flex items-center gap-1.5 text-lime uppercase font-semibold tracking-wider">
                                {getCategoryIcon(p.category || "")}
                                {p.category?.replace("-", " ")}
                              </span>
                              <span className="text-muted-foreground font-medium">{p.client_name}</span>
                            </div>

                            <h2 className="text-xl font-bold text-foreground group-hover:text-lime transition-colors">
                              {p.title}
                            </h2>

                            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                              {p.short_description}
                            </p>
                          </div>

                          {/* Tech pills */}
                          <div className="mt-6 flex flex-wrap gap-1.5 pt-4 border-t border-border/50">
                            {(p.technologies || []).slice(0, 4).map((tech) => (
                              <span
                                key={tech}
                                className="bg-muted text-foreground/80 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider border border-border/40"
                              >
                                {tech}
                              </span>
                            ))}
                            {(p.technologies || []).length > 4 && (
                              <span className="text-xs text-muted-foreground flex items-center ml-1">
                                +{(p.technologies || []).length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  </AnimatedSection>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="gradient-purple rounded-3xl p-10 md:p-16 text-center max-w-5xl mx-auto shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <h2 className="text-3xl md:text-5xl font-black text-foreground mb-4 tracking-tight">
                LAUNCHING A PROJECT?
              </h2>
              <p className="text-foreground/80 text-base md:text-lg mb-8 max-w-2xl mx-auto">
                Connect with our engineering and defense team. Let's build a secure, lightning-fast application tailored to your metrics.
              </p>
              <Link to="/contact">
                <Button variant="lime" size="lg" className="rounded-full text-base font-bold uppercase tracking-wider py-6 px-10">
                  Start Your Project <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default Works;
