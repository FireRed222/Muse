import React from "react";
import { motion } from "framer-motion";
import "./WavyText.scss";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const charAnim = {
  hidden: { opacity: 0, y: "0.3em" },
  show: {
    opacity: 1,
    y: "0em",
    transition: {
      ease: [0.42, 0, 0.58, 1],
      duration: 0.4,
    },
  },
};

export default function WavyText({
  text,
  glowColor,
}: {
  text: string;
  glowColor: string;
}) {
  return (
    <motion.div
      className="wavyText"
      variants={container}
      initial="hidden"
      animate="show"
      style={
        {
          "--glow-color": glowColor,
        } as React.CSSProperties
      }
    >
      {Array.from(text).map((char, index) => (
        <motion.span
          key={char + index}
          variants={charAnim}
          className="char"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.div>
  );
}
