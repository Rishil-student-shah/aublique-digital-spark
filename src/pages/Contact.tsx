import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FloatingShapes from "@/components/FloatingShapes";
import AnimatedSection from "@/components/AnimatedSection";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import Seo from "@/components/Seo";
import { Label } from "@/components/ui/label";
import contactData from "@/data/contact.json";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  business: z.string().trim().max(200),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", business: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [contactInfo] = useState({
    email: contactData.email || "",
    phone: contactData.phone || "",
    address: contactData.address || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      toast({ title: "Validation error", description: result.error.errors[0].message, variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("https://formspree.io/f/mnjkgwje", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          business: form.business.trim(),
          message: form.message.trim(),
        }),
      });

      if (response.ok) {
        toast({
          title: "Message sent successfully!",
          description: "Thank you for reaching out. We will get back to you shortly.",
        });
        setForm({ name: "", email: "", business: "", message: "" });
      } else {
        throw new Error("Failed to submit to Formspree");
      }
    } catch (err) {
      console.error("Formspree submission error:", err);
      toast({
        title: "Submission failed",
        description: "There was a problem sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const infoItems = [
    { icon: Mail, label: contactInfo.email },
    { icon: Phone, label: contactInfo.phone },
    { icon: MapPin, label: contactInfo.address },
  ].filter((c) => c.label);

  return (
    <div className="min-h-screen pt-16">
      <Seo
        title="Contact Aublique | Start Your Project"
        description="Tell us about your project. Aublique builds secure web, mobile, and cyber security solutions — get a response within one business day."
        path="/contact"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          name: "Aublique",
          url: "https://aublique.vercel.app/contact",
          email: contactInfo.email || undefined,
          telephone: contactInfo.phone || undefined,
          address: contactInfo.address || undefined,
        }}
      />
      {/* Hero */}
      <section className="relative py-32 overflow-hidden">
        <FloatingShapes />
        <div className="container mx-auto px-4 relative z-10">
          <motion.h1
            className="text-5xl md:text-7xl font-bold text-lime glow-lime mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Let's Build Something<br />Powerful.
          </motion.h1>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-5xl mx-auto">
            {/* Contact Info */}
            <AnimatedSection>
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-foreground">Get in Touch</h2>
                <div className="space-y-6">
                  {infoItems.map((c) => (
                    <div key={c.label} className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                        <c.icon className="w-5 h-5 text-lime" />
                      </div>
                      <span className="text-foreground">{c.label}</span>
                    </div>
                  ))}
                </div>
                <div className="gradient-purple rounded-3xl p-8 mt-8">
                  <h3 className="text-xl font-bold text-foreground mb-2">Ready to scale?</h3>
                  <p className="text-foreground/80 text-sm">Let's discuss how we can transform your digital presence with secure, scalable solutions.</p>
                </div>
              </div>
            </AnimatedSection>

            {/* Form */}
            <AnimatedSection delay={0.2}>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="contact-name" className="sr-only">Your Name</Label>
                  <Input id="contact-name" placeholder="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="bg-card border-border focus:border-lime focus:ring-lime/20 h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email" className="sr-only">Your Email</Label>
                  <Input id="contact-email" type="email" placeholder="Your Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="bg-card border-border focus:border-lime focus:ring-lime/20 h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-business" className="sr-only">Business Type</Label>
                  <Input id="contact-business" placeholder="Business Type" value={form.business} onChange={(e) => setForm({ ...form, business: e.target.value })} className="bg-card border-border focus:border-lime focus:ring-lime/20 h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-message" className="sr-only">Your Message</Label>
                  <Textarea id="contact-message" placeholder="Your Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows={5} className="bg-card border-border focus:border-lime focus:ring-lime/20" />
                </div>
                <Button variant="lime" size="lg" type="submit" className="w-full text-base" disabled={submitting}>
                  {submitting ? "Sending..." : "Send Message"} <Send className="ml-2 w-4 h-4" />
                </Button>
              </form>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
