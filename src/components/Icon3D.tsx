import { motion } from "framer-motion";

interface Icon3DProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}

const Icon3D = ({ src, alt, size = 80, className = "" }: Icon3DProps) => {
  return (
    <motion.div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size, perspective: 600 }}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      whileHover={{ rotateY: 18, rotateX: -10, scale: 1.08 }}
    >
      {/* glow halo */}
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-60"
        style={{
          background:
            "radial-gradient(circle, hsl(262 100% 66% / 0.5) 0%, hsl(75 100% 50% / 0.25) 50%, transparent 70%)",
        }}
      />
      {/* ground shadow */}
      <div
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-[50%] blur-md opacity-50"
        style={{
          width: size * 0.7,
          height: size * 0.12,
          background: "radial-gradient(ellipse, hsl(0 0% 0% / 0.7), transparent 70%)",
        }}
      />
      <img
        src={src}
        alt={alt}
        loading="lazy"
        width={size}
        height={size}
        className="relative drop-shadow-[0_8px_16px_rgba(140,82,255,0.45)] select-none pointer-events-none"
        style={{ width: size, height: size, objectFit: "contain" }}
      />
    </motion.div>
  );
};

export default Icon3D;
