import { motion } from "framer-motion";

const FloatingShapes = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Purple sphere */}
      <motion.div
        className="absolute w-32 h-32 rounded-full gradient-purple opacity-30 blur-sm"
        style={{ top: "15%", right: "10%" }}
        animate={{ y: [-20, 20, -20], rotate: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Teal cube */}
      <motion.div
        className="absolute w-20 h-20 rounded-lg bg-teal-light opacity-40 blur-[1px]"
        style={{ top: "60%", right: "20%", transform: "rotate(45deg)" }}
        animate={{ y: [-30, 10, -30], rotate: [45, 55, 45] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Small lime dot */}
      <motion.div
        className="absolute w-4 h-4 rounded-full bg-lime opacity-50"
        style={{ top: "30%", right: "35%" }}
        animate={{ y: [-10, 15, -10], x: [-5, 5, -5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Purple triangle-ish */}
      <motion.div
        className="absolute w-16 h-16 opacity-20"
        style={{ bottom: "20%", right: "8%", borderLeft: "30px solid transparent", borderRight: "30px solid transparent", borderBottom: "50px solid hsl(262 100% 66%)" }}
        animate={{ y: [-15, 25, -15], rotate: [0, -15, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Large blurred purple orb */}
      <motion.div
        className="absolute w-64 h-64 rounded-full opacity-10 blur-3xl"
        style={{ top: "10%", left: "5%", background: "radial-gradient(circle, hsl(262 100% 66%), transparent)" }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};

export default FloatingShapes;
