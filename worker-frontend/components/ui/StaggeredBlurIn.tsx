"use client";
import { motion } from "framer-motion";
import React, { ReactNode } from "react";

interface StaggeredBlurInProps {
  children: ReactNode;
  staggerDelay?: number;
  duration?: number;
}

export const StaggeredBlurIn = ({
  children,
  staggerDelay = 0.2,
  duration = 0.5,
}: StaggeredBlurInProps) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  const item = {
    hidden: {
      opacity: 0,
      filter: "blur(20px)",
      y: 20,
    },
    show: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        duration: duration,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      className="w-full h-full"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {React.Children.map(children, (child) => (
        <motion.div className="w-full" variants={item}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};
