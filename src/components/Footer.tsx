import { Link } from "react-router-dom";
import { useState } from "react";
import { Mail, Phone, MapPin, Instagram } from "lucide-react";
import aubliqueLogo from "@/assets/aublique-logo.png";
import contactData from "@/data/contact.json";

const Footer = () => {
  const [contactInfo] = useState({
    email: contactData.email || "",
    phone: contactData.phone || "",
    address: contactData.address || "",
  });

  const infoItems = [
    { icon: Mail, label: contactInfo.email },
    { icon: Phone, label: contactInfo.phone },
    { icon: MapPin, label: contactInfo.address },
  ].filter((c) => c.label);

  return (
    <footer className="glass py-12 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/">
              <img src={aubliqueLogo} alt="Aublique Digital Agency" className="h-8 mb-4 rounded" />
            </Link>
            <p className="text-muted-foreground text-sm">Digital Growth. Secured.</p>
            <div className="flex items-center gap-3 mt-3">
              <a href="https://www.instagram.com/aublique.co.in/" target="_blank" rel="noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-lime transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-3">Quick Links</h4>
            <div className="flex flex-col gap-2">
              {[
                { path: "/", label: "Home" },
                { path: "/about", label: "About" },
                { path: "/works", label: "Our Works" },
                { path: "/contact", label: "Contact" },
              ].map((link) => (
                <Link key={link.path} to={link.path} className="text-sm text-muted-foreground hover:text-lime transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-3">Services</h4>
            <div className="flex flex-col gap-2 text-sm">
              <Link to="/services/web-development" className="text-muted-foreground hover:text-lime transition-colors">Web Development</Link>
              <Link to="/services/cyber-security" className="text-muted-foreground hover:text-lime transition-colors">Cyber Security</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-3">Contact</h4>
            <div className="flex flex-col gap-3">
              {infoItems.map((c) => (
                <div key={c.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <c.icon className="w-4 h-4 text-lime flex-shrink-0" />
                  <span>{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Aublique. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
