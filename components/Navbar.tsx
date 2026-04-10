"use client";

import { useScrollProgress } from "@/lib/scroll-context";
import { motion, useTransform } from "framer-motion";
import Link from "next/link";

export function Navbar() {
  const scrollYProgress = useScrollProgress();
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.14],
    ["rgba(14, 14, 14, 0)", "rgba(14, 14, 14, 0.78)"]
  );
  const borderBottomColor = useTransform(
    scrollYProgress,
    [0, 0.22],
    ["rgba(200, 169, 126, 0)", "rgba(200, 169, 126, 0.18)"]
  );

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-40 border-b border-transparent backdrop-blur-[2px]"
      style={{
        backgroundColor,
        borderBottomColor,
        borderBottomWidth: 1,
        borderBottomStyle: "solid",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 md:px-10">
        <Link
          href="/"
          className="flex items-center gap-2 opacity-90 transition hover:opacity-100"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" width={28} height={28} className="h-7 w-7" />
          <span className="sr-only">Home</span>
        </Link>
        <nav className="flex gap-8 font-body text-sm tracking-wide text-warm-light/85">
          <a href="#projects" className="transition hover:text-accent">
            Projects
          </a>
          <a href="#contact" className="transition hover:text-accent">
            Contact
          </a>
        </nav>
      </div>
    </motion.header>
  );
}
