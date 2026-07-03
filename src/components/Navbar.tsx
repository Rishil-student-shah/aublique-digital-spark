import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import aubliqueLogo from "@/assets/aublique-logo.png";

const services = [
  { to: "/services/web-development", label: "Development & Technology" },
  { to: "/services/cyber-security", label: "Cyber Security" },
];

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/works", label: "Our Works" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const location = useLocation();
  const isServiceActive = location.pathname.startsWith("/services");

  return (
    <nav className="fixed top-4 left-4 right-4 md:left-8 md:right-8 z-50">
      <div className="container mx-auto flex items-center justify-between h-16 px-6 glass-strong rounded-full">
        <Link to="/" className="flex items-center">
          <img src={aubliqueLogo} alt="Aublique Digital Agency" className="h-8 rounded" />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.slice(0, 2).map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`lime-underline text-sm font-medium transition-colors ${
                location.pathname === link.to ? "text-lime" : "text-foreground hover:text-lime"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Services dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button
              className={`flex items-center gap-1 lime-underline text-sm font-medium transition-colors ${
                isServiceActive ? "text-lime" : "text-foreground hover:text-lime"
              }`}
            >
              Services
              <ChevronDown size={14} className={`transition-transform ${servicesOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {servicesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute left-1/2 -translate-x-1/2 top-full pt-3 min-w-[260px]"
                >
                  <div className="glass-strong rounded-2xl p-2 flex flex-col">
                    {services.map((s) => (
                      <Link
                        key={s.to}
                        to={s.to}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                          location.pathname === s.to
                            ? "text-lime bg-lime/10"
                            : "text-foreground hover:text-lime hover:bg-white/5"
                        }`}
                      >
                        {s.label}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {navLinks.slice(2).map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`lime-underline text-sm font-medium transition-colors ${
                location.pathname === link.to ? "text-lime" : "text-foreground hover:text-lime"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link to="/contact">
            <Button variant="lime" size="sm">Let's Build</Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98, clipPath: "inset(0 0 100% 0 round 2rem)" }}
            animate={{ opacity: 1, y: 0, scale: 1, clipPath: "inset(0 0 0% 0 round 2rem)" }}
            exit={{ opacity: 0, y: -8, scale: 0.98, clipPath: "inset(0 0 100% 0 round 2rem)" }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden glass-strong overflow-hidden rounded-[2rem] mt-2 origin-top"
          >
            <div className="flex flex-col gap-4 p-6">
              {navLinks.slice(0, 2).map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`text-lg font-medium ${
                    location.pathname === link.to ? "text-lime" : "text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile services */}
              <div>
                <button
                  onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                  className={`flex items-center justify-between w-full text-lg font-medium ${
                    isServiceActive ? "text-lime" : "text-foreground"
                  }`}
                >
                  Services
                  <ChevronDown size={18} className={`transition-transform ${mobileServicesOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {mobileServicesOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-3 pl-4 pt-3">
                        {services.map((s) => (
                          <Link
                            key={s.to}
                            to={s.to}
                            onClick={() => setOpen(false)}
                            className={`text-base ${
                              location.pathname === s.to ? "text-lime" : "text-foreground/80"
                            }`}
                          >
                            {s.label}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {navLinks.slice(2).map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`text-lg font-medium ${
                    location.pathname === link.to ? "text-lime" : "text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/contact" onClick={() => setOpen(false)}>
                <Button variant="lime" className="w-full">Let's Build</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
