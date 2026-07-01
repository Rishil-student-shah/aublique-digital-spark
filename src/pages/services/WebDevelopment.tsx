import { motion } from "framer-motion";
import { Globe, Code, Smartphone, Server, Zap, Shield, ArrowRight, Layers, Database } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import FloatingShapes from "@/components/FloatingShapes";
import AnimatedSection from "@/components/AnimatedSection";
import Seo from "@/components/Seo";

const subServices = [
  {
    icon: Globe,
    title: "Website Development",
    desc: "From landing pages to complex corporate sites — designed for speed, responsiveness, and conversion. Clean code, modern frameworks, and SEO-ready from day one.",
    features: ["Custom designs", "CMS integration", "Performance optimized", "Mobile-first approach"],
  },
  {
    icon: Code,
    title: "Web Applications",
    desc: "Full-stack web applications built with modern technologies. Dashboards, SaaS platforms, portals, and internal tools tailored to your workflow.",
    features: ["React / Next.js", "Real-time features", "API integration", "Cloud deployment"],
  },
  {
    icon: Smartphone,
    title: "Mobile App Development",
    desc: "Cross-platform and native mobile applications that deliver seamless experiences on iOS and Android. Built to engage, retain, and convert.",
    features: ["Cross-platform (React Native)", "Native iOS & Android", "Push notifications", "App Store deployment"],
  },
  {
    icon: Database,
    title: "CRM & ERP Integration",
    desc: "Connect your business systems. We integrate CRM, ERP, inventory, and accounting tools so your data flows seamlessly across platforms.",
    features: ["Salesforce / HubSpot", "Custom CRM solutions", "ERP connectivity", "Data migration & sync"],
  },
];

const process = [
  { step: "01", title: "Discovery", desc: "We understand your business, audience, and goals before writing a single line of code." },
  { step: "02", title: "Architecture", desc: "Planning the tech stack, database design, and scalable infrastructure." },
  { step: "03", title: "Development", desc: "Building with modern frameworks, clean code practices, and continuous testing." },
  { step: "04", title: "Launch & Support", desc: "Deployment, monitoring, and ongoing maintenance to keep things running smoothly." },
];

const WebDevelopment = () => (
  <div className="min-h-screen pt-16">
    <Seo
      title="Web & Mobile Development | Aublique"
      description="Custom websites, web apps, mobile apps, and CRM/ERP integrations — engineered for speed, scale, and security."
      path="/services/web-development"
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Development & Technology",
        provider: { "@type": "Organization", name: "Aublique" },
        description: "Full-stack web, mobile, and enterprise integration services.",
        areaServed: "Worldwide",
      }}
    />
    <section className="relative py-32 overflow-hidden">
      <FloatingShapes />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <Layers className="w-16 h-16 text-lime mb-6" />
          <h1 className="text-5xl md:text-7xl font-bold text-lime glow-lime mb-6">Development &<br />Technology</h1>
          <p className="text-xl text-foreground/80 max-w-2xl">Full-stack digital solutions — from websites and web apps to mobile apps and enterprise integrations.</p>
        </motion.div>
      </div>
    </section>

    {/* Sub-services */}
    <section className="py-24">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <h2 className="text-3xl md:text-5xl font-bold text-lime text-center mb-16">What We Build</h2>
        </AnimatedSection>
        <div className="space-y-12">
          {subServices.map((s, i) => (
            <AnimatedSection key={s.title} delay={i * 0.1}>
              <motion.div
                whileHover={{ boxShadow: "0 0 30px hsl(262 100% 66% / 0.2)" }}
                className="bg-card border border-border rounded-3xl p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start"
              >
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-3xl gradient-purple flex items-center justify-center">
                    <s.icon className="w-7 h-7 text-foreground" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-3">{s.title}</h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">{s.desc}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {s.features.map((f) => (
                      <span key={f} className="text-xs font-medium px-3 py-1 rounded-full bg-muted text-foreground/70">
                        {f}
                      </span>
                    ))}
                  </div>
                  <Link to="/contact">
                    <Button variant="lime" size="sm">Let's Build</Button>
                  </Link>
                </div>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* Process */}
    <section className="py-24">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <h2 className="text-3xl md:text-5xl font-bold text-lime text-center mb-16">Our Process</h2>
        </AnimatedSection>
        <div className="max-w-3xl mx-auto space-y-8">
          {process.map((p, i) => (
            <AnimatedSection key={p.step} delay={i * 0.15}>
              <div className="gradient-purple rounded-3xl p-8 flex items-start gap-6">
                <span className="text-4xl font-bold text-foreground/30">{p.step}</span>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{p.title}</h3>
                  <p className="text-foreground/80">{p.desc}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    <section className="py-16">
      <AnimatedSection>
        <div className="bg-lime mx-4 md:mx-auto max-w-5xl rounded-2xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-lime-foreground mb-4">Ready to build?</h2>
          <p className="text-lime-foreground/80 mb-6">Let's create something powerful together.</p>
          <Link to="/contact">
            <Button variant="purple" size="lg" className="text-lg px-10">Get Started <ArrowRight className="ml-2" /></Button>
          </Link>
        </div>
      </AnimatedSection>
    </section>
  </div>
);

export default WebDevelopment;
