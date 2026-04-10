"use client";

import { withBasePath } from "@/lib/basePath";
import { SITE } from "@/lib/siteConfig";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

export function Navbar() {
  const { scrollYProgress: pageScroll } = useScroll();
  /** Sayfa aşağı indikçe siyah zemin seyrekleşir; logo/link opak kalır. */
  const backgroundColor = useTransform(
    pageScroll,
    [0, 0.08, 0.35],
    ["rgba(0,0,0,1)", "rgba(0,0,0,0.72)", "rgba(0,0,0,0.22)"]
  );
  const borderBottomColor = useTransform(
    pageScroll,
    [0, 0.2],
    ["rgba(255,255,255,0.1)", "rgba(255,255,255,0)"]
  );

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-40 box-border min-h-[var(--nav-h)] border-b backdrop-blur-[1px]"
      style={{
        backgroundColor,
        borderBottomColor,
        borderBottomWidth: 1,
        borderBottomStyle: "solid",
      }}
    >
      <div className="mx-auto flex h-[var(--nav-h)] max-w-6xl items-center justify-between px-6 md:px-10">
        <Link
          href="/"
          className="flex items-center gap-3 opacity-95 transition hover:opacity-100"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={withBasePath("/logo.png")}
            alt={`${SITE.studioName} logo`}
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
          <span className="sr-only">Ana sayfa</span>
        </Link>
        <nav className="flex flex-wrap gap-6 font-body text-sm tracking-wide text-warm-light drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] md:gap-8">
        
          <Link href="/#İletişim" className="transition hover:text-accent">
            İletişim
          </Link>
        </nav>
      </div>
    </motion.header>
  );
}
