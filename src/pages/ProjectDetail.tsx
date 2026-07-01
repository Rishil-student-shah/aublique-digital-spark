import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight, Calendar, User, Tag, ChevronLeft, ChevronRight, X, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import FloatingShapes from "@/components/FloatingShapes";
import AnimatedSection from "@/components/AnimatedSection";
import Seo from "@/components/Seo";
import localProjects from "@/data/projects.json";
import { cn } from "@/lib/utils";

import {
  Zap,
  TrendingUp,
  Shield,
  Clock,
  Users,
  Star,
  Globe,
  Percent,
} from "lucide-react";

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

interface ResultMetric {
  label: string;
  value: string;
  icon: string;
}

interface GalleryItem {
  url: string;
  caption: string;
  type: string;
}

interface Milestone {
  phase: string;
  date: string;
  description: string;
}

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  zap: Zap,
  "trending-up": TrendingUp,
  shield: Shield,
  clock: Clock,
  users: Users,
  star: Star,
  globe: Globe,
  percent: Percent,
};

const MetricCounter = ({ metric }: { metric: ResultMetric }) => {
  const IconComp = ICON_MAP[metric.icon] || Zap;
  const numericVal = parseInt(metric.value.replace(/[^0-9]/g, "")) || 0;
  const nonNumeric = metric.value.replace(/[0-9]/g, "");
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted || numericVal === 0) return;

    let start = 0;
    const end = numericVal;
    const duration = 1.2;
    const totalFrames = 60 * duration;
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const easedProgress = progress * (2 - progress);
      const current = Math.floor(easedProgress * end);
      
      setCount(current);

      if (frame >= totalFrames) {
        setCount(end);
        clearInterval(timer);
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [hasStarted, numericVal]);

  return (
    <div
      ref={elementRef}
      className="bg-card border border-border p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden group hover:border-lime/30 transition-all duration-300"
    >
      <div className="w-12 h-12 rounded-xl bg-lime/10 flex items-center justify-center mb-4 text-lime group-hover:scale-110 transition-transform">
        <IconComp className="w-6 h-6" />
      </div>
      <span className="text-3xl md:text-4xl font-extrabold text-foreground">
        {numericVal > 0 ? (
          <>
            {count}
            {nonNumeric}
          </>
        ) : (
          metric.value
        )}
      </span>
      <span className="text-xs text-muted-foreground mt-2 font-semibold uppercase tracking-wider">
        {metric.label}
      </span>
    </div>
  );
};

const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<Project | null>(null);
  const [prevProject, setPrevProject] = useState<Project | null>(null);
  const [nextProject, setNextProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Gallery light box state
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    const fetchProjectAndSiblings = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        // Load projects from local JSON
        const allProjects = (localProjects as Project[]).filter((p) => p.published);
        const current = allProjects.find((p) => p.slug === slug);

        if (!current) {
          setProject(null);
          setLoading(false);
          return;
        }

        setProject(current);

        // Fetch sibling projects for navigation
        if (allProjects.length > 1) {
          const index = allProjects.findIndex((p) => p.id === current.id);
          if (index !== -1) {
            setPrevProject(index > 0 ? allProjects[index - 1] : allProjects[allProjects.length - 1]);
            setNextProject(index < allProjects.length - 1 ? allProjects[index + 1] : allProjects[0]);
          }
        }
      } catch (err) {
        console.error("Error loading project:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndSiblings();
    // Scroll to top on slug change
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="w-10 h-10 border-2 border-lime border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20 px-4">
        <h2 className="text-3xl font-extrabold text-lime glow-lime mb-2">CASE STUDY NOT FOUND</h2>
        <p className="text-muted-foreground text-center max-w-sm mb-6">
          The requested project might have been drafted or removed.
        </p>
        <Link to="/works">
          <Button variant="lime" className="rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Works
          </Button>
        </Link>
      </div>
    );
  }

  // Parse JSON values safely
  const timeline: Milestone[] = Array.isArray(project.timeline)
    ? (project.timeline as any)
    : [];
  const results: ResultMetric[] = Array.isArray(project.results)
    ? (project.results as any)
    : [];
  const gallery: GalleryItem[] = Array.isArray(project.gallery)
    ? (project.gallery as any)
    : [];

  return (
    <div className="min-h-screen pb-16 bg-background relative overflow-hidden">
      <Seo
        title={`${project.title} | Aublique Case Study`}
        description={project.short_description || `Detail overview of ${project.title}`}
        path={`/works/${project.slug}`}
      />
      <FloatingShapes />

      {/* Hero Banner Section */}
      <section ref={heroRef} className="relative min-h-[60vh] flex items-end justify-start overflow-hidden pt-24 pb-16">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0 z-0">
          {project.thumbnail ? (
            <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-card" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </motion.div>

        <div className="container mx-auto px-4 relative z-10">
          <Link
            to="/works"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-lime hover:text-lime-foreground bg-lime/10 px-4 py-2 rounded-full border border-lime/20 mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Works
          </Link>

          <div className="max-w-4xl space-y-4">
            <h1 className="text-4xl md:text-6xl font-black text-foreground leading-tight tracking-tight uppercase">
              {project.title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              {project.short_description}
            </p>
          </div>
        </div>
      </section>

      {/* Quick Info Bar */}
      <section className="py-6 border-y border-border/80 bg-card/20 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-foreground">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-lime/10 flex items-center justify-center text-lime">
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Category</p>
                <p className="font-semibold capitalize mt-0.5">{project.category?.replace("-", " ")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple/10 flex items-center justify-center text-purple">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Client</p>
                <p className="font-semibold mt-0.5">{project.client_name || "Internal Project"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-lime/10 flex items-center justify-center text-lime">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Completed</p>
                <p className="font-semibold mt-0.5">
                  {project.completion_date
                    ? new Date(project.completion_date).toLocaleDateString(undefined, {
                        month: "long",
                        year: "numeric",
                      })
                    : "Continuous"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4 space-y-20 max-w-5xl">
          {/* Overview */}
          {project.full_description && (
            <AnimatedSection className="space-y-4">
              <h2 className="text-xl font-bold text-lime uppercase tracking-wider border-b border-border pb-2">
                Project Overview
              </h2>
              <div
                className="prose prose-invert max-w-none text-muted-foreground text-base leading-relaxed prose-headings:text-foreground prose-strong:text-foreground prose-a:text-lime"
                dangerouslySetInnerHTML={{ __html: project.full_description }}
              />
            </AnimatedSection>
          )}

          {/* Results/Metrics Grid */}
          {results.length > 0 && (
            <AnimatedSection className="space-y-6">
              <h2 className="text-xl font-bold text-lime uppercase tracking-wider border-b border-border/80 pb-2">
                Outcomes & Performance
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {results.map((metric, i) => (
                  <MetricCounter key={i} metric={metric} />
                ))}
              </div>
            </AnimatedSection>
          )}

          {/* Challenges & Solution side-by-side */}
          {(project.challenges || project.solution) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {project.challenges && (
                <AnimatedSection className="space-y-4">
                  <div className="bg-card border border-border p-6 rounded-3xl h-full shadow-lg">
                    <h3 className="text-lg font-bold text-lime uppercase tracking-wider mb-3">The Challenges</h3>
                    <div
                      className="prose prose-invert max-w-none text-muted-foreground text-sm leading-relaxed prose-headings:text-foreground prose-a:text-lime"
                      dangerouslySetInnerHTML={{ __html: project.challenges }}
                    />
                  </div>
                </AnimatedSection>
              )}
              {project.solution && (
                <AnimatedSection className="space-y-4">
                  <div className="bg-card border border-border p-6 rounded-3xl h-full shadow-lg">
                    <h3 className="text-lg font-bold text-purple uppercase tracking-wider mb-3">Our Solution</h3>
                    <div
                      className="prose prose-invert max-w-none text-muted-foreground text-sm leading-relaxed prose-headings:text-foreground prose-a:text-lime"
                      dangerouslySetInnerHTML={{ __html: project.solution }}
                    />
                  </div>
                </AnimatedSection>
              )}
            </div>
          )}

          {/* Timeline Visual (if items exist) */}
          {timeline.length > 0 && (
            <AnimatedSection className="space-y-8">
              <h2 className="text-xl font-bold text-lime uppercase tracking-wider border-b border-border pb-2 mb-8">
                Execution Timeline
              </h2>
              <div className="max-w-3xl mx-auto relative pl-6 md:pl-16">
                {/* Vertical connecting line */}
                <div className="absolute left-[13px] md:left-[23px] top-4 bottom-4 w-px bg-border/60" />
                <div className="space-y-8">
                  {timeline.map((step, i) => (
                    <div key={i} className="flex gap-4 md:gap-8 relative">
                      <div className="absolute -left-[20px] md:-left-[48px] w-8 h-8 rounded-full bg-card border-2 border-lime flex items-center justify-center text-lime font-bold text-xs">
                        {i + 1}
                      </div>
                      <div className="bg-card border border-border rounded-2xl p-5 md:p-6 flex-1 shadow-md hover:border-lime/20 transition-all">
                        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                          <h4 className="font-bold text-foreground text-sm uppercase tracking-wide">{step.phase}</h4>
                          {step.date && <span className="text-xs text-lime font-semibold">{step.date}</span>}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          )}

          {/* Testimonial Box */}
          {project.testimonial_text && (
            <AnimatedSection>
              <div className="bg-card border border-purple/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-16 -right-16 w-36 h-36 bg-purple/5 rounded-full blur-2xl" />
                <Quote className="w-10 h-10 text-purple/20 mb-4" />
                <blockquote className="text-base md:text-lg text-foreground italic leading-relaxed pl-4 border-l-2 border-lime">
                  "{project.testimonial_text}"
                </blockquote>
                {(project.testimonial_author || project.testimonial_role) && (
                  <p className="text-xs text-muted-foreground mt-4 pl-4">
                    — <span className="font-bold text-foreground">{project.testimonial_author}</span>
                    {project.testimonial_role && (
                      <span className="text-lime"> · {project.testimonial_role}</span>
                    )}
                  </p>
                )}
              </div>
            </AnimatedSection>
          )}

          {/* Screen Gallery visual */}
          {gallery.length > 0 && (
            <AnimatedSection className="space-y-6">
              <h2 className="text-xl font-bold text-lime uppercase tracking-wider border-b border-border pb-2">
                Interface Gallery & Screens
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {gallery.map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setActiveImageIndex(i)}
                    className="bg-card border border-border rounded-2xl overflow-hidden cursor-pointer shadow-md group relative aspect-video"
                  >
                    <img
                      src={item.url}
                      alt={item.caption}
                      className={cn(
                        "w-full h-full transition-all duration-300",
                        item.type === "mobile" ? "object-contain bg-black/40 p-2" : "object-cover"
                      )}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <p className="text-xs text-foreground font-medium truncate">{item.caption || "Click to zoom"}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatedSection>
          )}

          {/* Full stack tag details */}
          {project.technologies && project.technologies.length > 0 && (
            <AnimatedSection className="space-y-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Full Stack Technologies Used
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="bg-muted text-foreground/80 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-border"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </AnimatedSection>
          )}

          {/* Nav Sibling buttons */}
          <div className="border-t border-border pt-8 flex items-center justify-between gap-4">
            {prevProject ? (
              <Link
                to={`/works/${prevProject.slug}`}
                className="flex items-center gap-2.5 text-xs uppercase font-bold text-muted-foreground hover:text-lime transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </Link>
            ) : (
              <div />
            )}
            {nextProject && (
              <Link
                to={`/works/${nextProject.slug}`}
                className="flex items-center gap-2.5 text-xs uppercase font-bold text-muted-foreground hover:text-lime transition-colors ml-auto"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Lightbox Modal slider */}
      <AnimatePresence>
        {activeImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          >
            {/* Close button */}
            <button
              onClick={() => setActiveImageIndex(null)}
              className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors"
              title="Close viewer"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Left Nav */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveImageIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : gallery.length - 1));
              }}
              className="absolute left-6 text-muted-foreground hover:text-lime transition-colors"
              title="Previous"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>

            {/* Image & Caption */}
            <div className="max-w-4xl max-h-[80vh] flex flex-col items-center">
              <motion.img
                key={activeImageIndex}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                src={gallery[activeImageIndex].url}
                alt={gallery[activeImageIndex].caption}
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
              />
              {gallery[activeImageIndex].caption && (
                <p className="text-sm text-foreground mt-4 text-center px-6">
                  {gallery[activeImageIndex].caption}
                </p>
              )}
            </div>

            {/* Right Nav */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveImageIndex((prev) => (prev !== null && prev < gallery.length - 1 ? prev + 1 : 0));
              }}
              className="absolute right-6 text-muted-foreground hover:text-lime transition-colors"
              title="Next"
            >
              <ChevronRight className="w-10 h-10" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectDetail;
