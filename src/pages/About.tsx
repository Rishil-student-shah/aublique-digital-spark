import { motion } from "framer-motion";
import { Linkedin, CheckCircle } from "lucide-react";
import FloatingShapes from "@/components/FloatingShapes";
import AnimatedSection from "@/components/AnimatedSection";
import bhumitPhoto from "@/assets/bhumit.jpg.asset.json";
import rishilPhoto from "@/assets/rishil.jpg.asset.json";
import Seo from "@/components/Seo";


const founders = [
  {
    name: "Bhumit Parmar",
    role: "Founder & CEO",
    bio: "Founder and strategist behind Aublique's vision. Bhumit leads product direction, business operations, and security strategy — setting the roadmap for resilient digital platforms and ensuring every solution is built to scale and protected against modern threats.",
    linkedin: "https://linkedin.com/in/bhumitparmar02",
    image: bhumitPhoto.url,
  },
  {
    name: "Rishil Shah",
    role: "Co-Founder & COO",
    bio: "Strategist, developer, and operator driving Aublique's growth engine. Rishil leads client partnerships, engineering, brand, and go-to-market — translating business goals into structured digital roadmaps and building the systems that deliver measurable outcomes.",
    linkedin: "https://linkedin.com/in/rishil-shah-446674338",
    image: rishilPhoto.url,
  },
];

const helpWith = [
  "Don't have a website and want to go digital",
  "Have a website but lack performance or security",
  "Need strong cyber protection for their online presence",
];

const approach = [
  { title: "Understand the Business", desc: "We begin with clarity. Your goals, your audience, your challenges." },
  { title: "Build the Digital Framework", desc: "Clean architecture. Strong backend. Scalable design." },
  { title: "Secure the System", desc: "Protection layers, optimized setup, and risk mitigation." },
  { title: "Enable Growth", desc: "Growth systems that bring measurable results." },
];

const promises = [
  "Clear communication",
  "Structured execution",
  "Secure implementation",
  "Scalable solutions",
  "Long-term partnership mindset",
];

const About = () => {
  return (
    <div className="min-h-screen pt-16">
      <Seo
        title="About Aublique | Our Story & Founders"
        description="Meet the founders of Aublique and learn how we build secure, scalable digital products that drive measurable growth."
        path="/about"
      />
      {/* Hero */}
      <section className="relative py-32 overflow-hidden">
        <FloatingShapes />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-5xl md:text-7xl font-bold text-lime glow-lime mb-4">About Aublique</h1>
            <p className="text-xl text-foreground/80 max-w-2xl">Digital Growth. Secured.</p>
          </motion.div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <AnimatedSection>
            <h2 className="text-3xl md:text-5xl font-bold text-lime mb-8">Who We Are</h2>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <div className="space-y-6 text-foreground/80 text-lg">
              <p>Aublique is a modern digital agency built for businesses that are ready to step into the future.</p>
              <p>We don't just build websites.<br /><span className="text-lime font-bold">We build digital foundations.</span></p>
              <p>In today's world, being online is no longer optional. Visibility drives credibility. Security protects growth. Strategy defines success.</p>
              <p>Aublique exists to bring all three together.</p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <h3 className="text-2xl font-bold text-foreground mt-12 mb-6">We help businesses that:</h3>
            <div className="space-y-3">
              {helpWith.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-lime flex-shrink-0 mt-1" />
                  <p className="text-foreground/80">{item}</p>
                </div>
              ))}
            </div>
            <p className="text-lime font-bold text-lg mt-6">We turn offline businesses into online powerhouses — securely.</p>
          </AnimatedSection>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <AnimatedSection>
            <h2 className="text-3xl md:text-5xl font-bold text-lime mb-8">Our Philosophy</h2>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <div className="gradient-purple rounded-2xl p-10 md:p-14 mb-8">
              <h3 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-6">Structure. Strategy. Security.</h3>
              <div className="space-y-3 text-foreground/90 text-center text-lg">
                <p>Without structure, growth collapses.</p>
                <p>Without strategy, effort is wasted.</p>
                <p>Without security, everything is vulnerable.</p>
              </div>
            </div>
            <p className="text-foreground/80 text-lg text-center">Aublique integrates all three into every project.</p>
          </AnimatedSection>
        </div>
      </section>

      {/* Approach */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <AnimatedSection>
            <h2 className="text-3xl md:text-5xl font-bold text-lime mb-12">Our Approach</h2>
          </AnimatedSection>
          <div className="space-y-6">
            {approach.map((a, i) => (
              <AnimatedSection key={a.title} delay={i * 0.1}>
                <div className="bg-card border border-border rounded-3xl p-8 flex items-start gap-6">
                  <span className="text-3xl font-bold text-lime">0{i + 1}</span>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{a.title}</h3>
                    <p className="text-muted-foreground">{a.desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
          <AnimatedSection delay={0.5}>
            <p className="text-foreground/80 text-lg mt-8">We don't sell random services.<br /><span className="text-lime font-bold">We build long-term digital ecosystems.</span></p>
          </AnimatedSection>
        </div>
      </section>

      {/* Who We Work With */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <AnimatedSection>
            <h2 className="text-3xl md:text-5xl font-bold text-lime mb-8">Who We Work With</h2>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <div className="space-y-3 mb-8">
              {["Startups entering the digital space", "Small businesses scaling online", "Established businesses upgrading their systems", "Entrepreneurs building new ventures"].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-lime flex-shrink-0 mt-1" />
                  <p className="text-foreground/80 text-lg">{item}</p>
                </div>
              ))}
            </div>
            <p className="text-foreground/80 text-lg">If you are serious about taking your business online — <span className="text-lime font-bold">we are serious about building it right.</span></p>
          </AnimatedSection>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <h2 className="text-3xl md:text-5xl font-bold text-lime text-center mb-6">Leadership</h2>
            <p className="text-foreground/80 text-lg text-center max-w-2xl mx-auto mb-16">Aublique is founded by professionals passionate about digital systems, growth engineering, and secure architecture.</p>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {founders.map((f, i) => (
              <AnimatedSection key={f.name} delay={i * 0.2}>
                <motion.div
                  whileHover={{ borderColor: "hsl(262 100% 66%)", boxShadow: "0 0 20px hsl(262 100% 66% / 0.25)" }}
                  className="bg-card border-2 border-border rounded-3xl p-8 text-center transition-colors"
                >
                  <div className="w-32 h-32 rounded-full mx-auto mb-6 overflow-hidden border-2 border-lime/40">
                    <img src={f.image} alt={`${f.name} — ${f.role}`} className="w-full h-full object-cover" style={{ objectPosition: f.name === "Bhumit Parmar" ? "center 20%" : "center" }} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{f.name}</h3>
                  <p className="text-purple text-sm font-medium mb-3">{f.role}</p>
                  <p className="text-muted-foreground text-sm mb-4">{f.bio}</p>
                  <a href={f.linkedin} target="_blank" rel="noreferrer" className="inline-flex text-lime hover:text-lime/80 transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
          <AnimatedSection delay={0.4}>
            <div className="text-center mt-12 max-w-2xl mx-auto">
              <p className="text-foreground/80 text-lg">The vision is simple: <span className="text-lime font-bold">Create digital platforms that are powerful, protected, and built to scale.</span></p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Why Aublique */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <AnimatedSection>
            <h2 className="text-3xl md:text-5xl font-bold text-lime mb-8">Why Aublique?</h2>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <div className="space-y-6 text-foreground/80 text-lg">
              <p>Because most agencies do one thing.</p>
              <p>We combine <span className="text-lime font-bold">development and security</span> into one unified strategy.</p>
              <p>We don't believe in shortcuts. We believe in foundations.</p>
              <p>We don't chase trends. We build systems.</p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Our Promise */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <AnimatedSection>
            <h2 className="text-3xl md:text-5xl font-bold text-lime mb-8">Our Promise</h2>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <div className="space-y-3 mb-8">
              {promises.map((p) => (
                <div key={p} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-lime flex-shrink-0 mt-1" />
                  <p className="text-foreground/80 text-lg">{p}</p>
                </div>
              ))}
            </div>
            <p className="text-foreground/80 text-lg">We are not here for one project.<br /><span className="text-lime font-bold">We are here to build your digital future.</span></p>
          </AnimatedSection>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <AnimatedSection>
            <div className="gradient-purple rounded-2xl p-12 md:p-16 text-center">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">Let's Build Something Powerful</h2>
              <div className="space-y-4 text-foreground/90 text-lg mb-8">
                <p>If your business is not online, <span className="font-bold">you are invisible.</span></p>
                <p>If your business is online but unsecured, <span className="font-bold">you are vulnerable.</span></p>
                <p>If your business is online and secure but not growing, <span className="font-bold">you are stagnant.</span></p>
                <p className="text-2xl font-bold text-foreground mt-6">Aublique bridges that gap.</p>
              </div>
              <p className="text-xl font-bold text-lime">Digital Growth. Secured.</p>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default About;
