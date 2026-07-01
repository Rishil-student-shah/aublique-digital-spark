import { motion } from "framer-motion";
import { Shield, Lock, Eye, AlertTriangle, FileCheck, Server, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import FloatingShapes from "@/components/FloatingShapes";
import AnimatedSection from "@/components/AnimatedSection";
import Seo from "@/components/Seo";

const subServices = [
  {
    icon: Shield,
    title: "Cyber Security",
    desc: "Enterprise-grade protection for your digital assets. From penetration testing and threat monitoring to compliance audits and incident response.",
    features: ["Penetration testing", "24/7 threat monitoring", "Compliance (GDPR, ISO)", "Incident response"],
  },
];

const threats = [
  "Ransomware attacks increased 150% in 2025",
  "Average data breach costs $4.5M",
  "60% of small businesses close within 6 months of a breach",
  "Human error causes 82% of security incidents",
];

const securityLayers = [
  { icon: Lock, title: "Prevention", desc: "Firewalls, encryption, access control, and hardened infrastructure." },
  { icon: Eye, title: "Detection", desc: "Real-time monitoring, anomaly detection, and vulnerability scanning." },
  { icon: AlertTriangle, title: "Response", desc: "Rapid containment, forensic analysis, and disaster recovery." },
  { icon: FileCheck, title: "Compliance", desc: "GDPR, ISO 27001, SOC 2 — structured compliance frameworks." },
];

const CyberSecurity = () => (
  <div className="min-h-screen pt-16">
    <Seo
      title="Cyber Security Services | Aublique"
      description="Penetration testing, 24/7 threat monitoring, compliance (GDPR, ISO), and incident response for modern businesses."
      path="/services/cyber-security"
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Cyber Security",
        provider: { "@type": "Organization", name: "Aublique" },
        description: "Enterprise-grade protection: pen testing, monitoring, compliance, and incident response.",
        areaServed: "Worldwide",
      }}
    />
    <section className="relative py-32 overflow-hidden">
      <FloatingShapes />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <Shield className="w-16 h-16 text-lime mb-6" />
          <h1 className="text-5xl md:text-7xl font-bold text-lime glow-lime mb-6">Cyber<br />Security</h1>
          <p className="text-xl text-foreground/80 max-w-2xl">Enterprise-grade protection to secure your digital assets and operations.</p>
        </motion.div>
      </div>
    </section>

    {/* Sub-services */}
    <section className="py-24">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <h2 className="text-3xl md:text-5xl font-bold text-lime text-center mb-16">Our Services</h2>
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

    {/* Threat landscape */}
    <section className="py-24">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <div className="gradient-purple rounded-2xl p-12 md:p-16 max-w-4xl mx-auto mb-24">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">The Threat Landscape</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {threats.map((t, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-foreground flex-shrink-0 mt-1" />
                  <p className="text-foreground/90">{t}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* Security layers */}
        <AnimatedSection>
          <h2 className="text-3xl md:text-5xl font-bold text-lime text-center mb-16">Security Layers</h2>
        </AnimatedSection>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {securityLayers.map((l, i) => (
            <AnimatedSection key={l.title} delay={i * 0.1}>
              <motion.div whileHover={{ y: -8, boxShadow: "0 0 30px hsl(262 100% 66% / 0.3)" }} className="bg-card border border-border rounded-3xl p-6 h-full text-center">
                <l.icon className="w-8 h-8 text-lime mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">{l.title}</h3>
                <p className="text-muted-foreground text-sm">{l.desc}</p>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    <section className="py-16">
      <AnimatedSection>
        <div className="bg-lime mx-4 md:mx-auto max-w-5xl rounded-2xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-lime-foreground mb-4">Secure your business today</h2>
          <p className="text-lime-foreground/80 mb-6">Don't wait for a breach. Let's build your security framework.</p>
          <Link to="/contact">
            <Button variant="purple" size="lg" className="text-lg px-10">Get Protected <ArrowRight className="ml-2" /></Button>
          </Link>
        </div>
      </AnimatedSection>
    </section>
  </div>
);

export default CyberSecurity;
