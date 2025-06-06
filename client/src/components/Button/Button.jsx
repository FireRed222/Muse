import { motion } from "framer-motion";
import React from 'react'

const CoolButton = ({ text = "Click Me", onClick }) => {
  return (
    <motion.button
      whileHover={{
        scale: 1.1,
        boxShadow: "0px 0px 12px rgba(255, 255, 255, 0.6)",
        transition: { type: "spring", stiffness: 300 },
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        padding: "14px 32px",
        fontSize: "1.1rem",
        fontWeight: 600,
        background: "linear-gradient(135deg, #ff00cc, #3333ff)",
        color: "#fff",
        border: "none",
        borderRadius: "12px",
        cursor: "pointer",
        outline: "none",
        backdropFilter: "blur(8px)",
        transition: "all 0.3s ease-in-out",
      }}
    >
      {text}
    </motion.button>
  );
};

export default CoolButton;
