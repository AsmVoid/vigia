"use client";

import * as React from "react";
import * as motion from "motion/react-client";
import { ShaderBackground } from "@/components/shared/shader-background";

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthCard({ children, title, subtitle }: AuthCardProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050507] p-4">
      {/* WebGL Shader Background (Framer Premium Flow with IG Palette) */}
      <ShaderBackground
        pattern="premium"
        dotSize={35}
        spacing={2}
        speed={0.8}
        angle={45}
      />
      {/* Animated gradient orbs */}
      <motion.div
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-ig-gradient opacity-20 blur-3xl"
        animate={{
          x: [0, 40, 0],
          y: [0, 30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-ig-gradient opacity-15 blur-3xl"
        animate={{
          x: [0, -30, 0],
          y: [0, -40, 0],
          scale: [1.1, 1, 1.1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Glass card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
        }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass rounded-3xl glow-ig p-8 sm:p-10">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.1,
            }}
            className="mb-8 text-center"
          >
            <h1 className="text-4xl font-black tracking-tight text-ig-gradient">
              V.I.G.I.A
            </h1>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
              Open-Source Intelligence
            </p>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6 text-center"
          >
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </motion.div>

          {/* Form content */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.3,
            }}
          >
            {children}
          </motion.div>
        </div>
      </motion.div>
    </main>
  );
}
