import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import FloatingShapes from "@/components/FloatingShapes";
import AnimatedSection from "@/components/AnimatedSection";
import Icon3D from "@/components/Icon3D";
import { useRef } from "react";
import FluidCursor from "@/components/FluidCursor";
import icon3dDevelopment from "@/assets/icon3d-development.png";
import icon3dSecurity from "@/assets/icon3d-security.png";
import icon3dLock from "@/assets/icon3d-lock.png";
import icon3dBolt from "@/assets/icon3d-bolt.png";
import icon3dTeam from "@/assets/icon3d-team.png";
import Seo from "@/components/Seo";

const services = [
  {
    icon: icon3dDevelopment,
    title: "Development & Technology",
    desc: "Full-stack digital solutions — from websites and web apps to mobile apps and enterprise integrations.",
    link: "/services/web-development",
    subs: ["Website Development", "Web Applications", "Mobile App Development", "CRM & ERP Integration"],
  },
  {
    icon: icon3dSecurity,
    title: "Cyber Security",
    desc: "Enterprise-grade protection to secure your digital assets and operations.",
    link: "/services/cyber-security",
    subs: ["Penetration Testing", "Threat Monitoring", "Compliance", "Incident Response"],
  },
];


const benefits = [
  { icon: icon3dLock, title: "Secure by Design", desc: "Every project ships with enterprise-grade security baked in from day one." },
  { icon: icon3dBolt, title: "Lightning Fast", desc: "Optimized performance that keeps users engaged and search engines happy." },
  { icon: icon3dTeam, title: "Dedicated Team", desc: "A focused team that treats your project like their own business." },
];

const processSteps = [
  { num: "01", title: "Discover", desc: "We understand your business, audience, and challenges." },
  { num: "02", title: "Strategize", desc: "We plan architecture, stack, and security layers." },
  { num: "03", title: "Build & Protect", desc: "We develop, automate, and secure — all in parallel." },
  { num: "04", title: "Launch & Grow", desc: "We deploy, monitor, optimize, and scale with you." },
];


const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen">
      <Seo
        title="Aublique | Digital Growth. Secured."
        description="Aublique builds secure, scalable web, mobile, and cyber security solutions for ambitious brands."
        path="/"
      />
      {/* Hero with parallax */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden pt-16">
        {/* Fluid mouse-tracking effect */}
        <FluidCursor />
        <FloatingShapes />
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <motion.h1
              className="text-5xl md:text-7xl lg:text-8xl font-bold text-lime glow-lime leading-tight mb-6"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              We Build<br />Digital Power.
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-foreground/80 mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Digital Growth. Secured.
            </motion.p>
            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Link to="/contact">
                <Button variant="purple" size="lg" className="text-base px-8">
                  Let's Build <ArrowRight className="ml-2" />
                </Button>
              </Link>
              <Link to="/works">
                <Button variant="lime" size="lg" className="text-base px-8">
                  View Our Work
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Problem */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="gradient-purple rounded-2xl p-12 md:p-16 text-center">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                Growth without security is risk.
              </h2>
              <p className="text-foreground/80 text-lg max-w-2xl mx-auto">
                In the digital era, scaling without protection means building on a fragile foundation. We ensure your growth is secured.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>


      {/* Services — 3 categories with sub-services */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <h2 className="text-3xl md:text-5xl font-bold text-lime text-center mb-4">Our Services</h2>
            <p className="text-muted-foreground text-lg text-center max-w-2xl mx-auto mb-16">
              Everything you need to go digital, grow fast, and stay protected.
            </p>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {services.map((s, i) => (
              <AnimatedSection key={s.title} delay={i * 0.15}>
                <Link to={s.link}>
                  <motion.div
                    whileHover={{ y: -8, boxShadow: "0 0 30px hsl(262 100% 66% / 0.3)" }}
                    transition={{ duration: 0.3 }}
                    className="bg-card border border-border rounded-3xl p-8 h-full group cursor-pointer flex flex-col"
                  >
                    <Icon3D src={s.icon} alt={s.title} size={88} className="mb-6" />
                    <h3 className="text-xl font-bold text-foreground mb-3 lime-underline inline-block">{s.title}</h3>
                    <p className="text-muted-foreground mt-2 mb-6">{s.desc}</p>
                    <ul className="space-y-2 mt-auto mb-4">
                      {s.subs.map((sub) => (
                        <li key={sub} className="flex items-center gap-2 text-sm text-foreground/70">
                          <CheckCircle className="w-4 h-4 text-lime flex-shrink-0" />
                          {sub}
                        </li>
                      ))}
                    </ul>
                    <span className="inline-flex items-center text-lime text-sm font-medium mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
                      Explore Services <ArrowRight className="ml-1 w-4 h-4" />
                    </span>
                  </motion.div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* How We Work — animated process */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <h2 className="text-3xl md:text-5xl font-bold text-lime text-center mb-16">How We Work</h2>
          </AnimatedSection>
          <div className="max-w-3xl mx-auto relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border hidden md:block" />
            <div className="space-y-8">
              {processSteps.map((p, i) => (
                <AnimatedSection key={p.num} delay={i * 0.15}>
                  <motion.div
                    whileHover={{ x: 8 }}
                    className="flex items-start gap-6 md:pl-16 relative"
                  >
                    <span className="hidden md:flex absolute left-0 w-12 h-12 rounded-full bg-card border-2 border-lime items-center justify-center text-lime font-bold text-sm">
                      {p.num}
                    </span>
                    <div className="gradient-purple rounded-3xl p-6 md:p-8 flex-1">
                      <span className="md:hidden text-lime font-bold mr-2">{p.num}</span>
                      <h3 className="text-xl font-bold text-foreground mb-2 inline md:block">{p.title}</h3>
                      <p className="text-foreground/80">{p.desc}</p>
                    </div>
                  </motion.div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <h2 className="text-3xl md:text-5xl font-bold text-lime text-center mb-4">Why Choose Aublique?</h2>
            <p className="text-muted-foreground text-lg text-center max-w-2xl mx-auto mb-16">We combine development and security into one unified strategy.</p>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((b, i) => (
              <AnimatedSection key={b.title} delay={i * 0.15}>
                <motion.div
                  whileHover={{ scale: 1.03, boxShadow: "0 0 35px hsl(262 100% 66% / 0.25)" }}
                  className="gradient-purple rounded-3xl p-8 h-full transition-shadow"
                >
                  <Icon3D src={b.icon} alt={b.title} size={80} className="mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-2">{b.title}</h3>
                  <p className="text-foreground/80">{b.desc}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <h2 className="text-3xl md:text-5xl font-bold text-lime text-center mb-16">Secure. Scalable. Strategic.</h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { word: "Secure.", desc: "Enterprise-grade protection from day one." },
              { word: "Scalable.", desc: "Built to handle growth without breaking." },
              { word: "Strategic.", desc: "Every decision backed by data and purpose." },
            ].map((item, i) => (
              <AnimatedSection key={item.word} delay={i * 0.2}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-card border border-border rounded-3xl p-10"
                >
                  <h3 className="text-4xl md:text-5xl font-bold text-foreground mb-3">{item.word}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <AnimatedSection>
          <div className="gradient-purple mx-4 md:mx-auto max-w-5xl rounded-2xl p-12 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Let's Build Something Powerful</h2>
            <p className="text-foreground/80 text-lg mb-8 max-w-2xl mx-auto">Your digital presence should be secure, scalable, and strategic. Let's make it happen.</p>
            <Link to="/contact">
              <Button variant="lime" size="lg" className="text-lg px-10">
                Get Started <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
        </AnimatedSection>
      </section>
    </div>
  );
};

export default Index;
