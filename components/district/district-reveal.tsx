"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import Image from "next/image";
import { GridReveal } from "@/components/rare/grid-reveal";

/**
 * One-time reveal of the district image on the About page. Under reduced
 * motion, or after the reveal has completed, it is a plain next/image.
 */
export function DistrictReveal({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (reduce) {
      setDone(true);
      return;
    }
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setStart(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStart(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  return (
    <figure ref={ref} className="overflow-hidden rounded-20 bg-sand-base ring-1 ring-sand-stroke">
      <div className="relative aspect-[16/10] w-full">
        {done ? (
          <Image src={src} alt={alt} fill sizes="(min-width: 1280px) 1216px, 100vw" className="object-cover" priority={false} />
        ) : start ? (
          <GridReveal src={src} alt={alt} aspect={16 / 10} estimatedDuration={4200} onRevealComplete={() => setDone(true)} className="size-full" />
        ) : (
          <div aria-hidden="true" className="size-full bg-sand-base" />
        )}
      </div>
      <figcaption className="px-4 py-3 text-label-xs text-sub-600">{caption}</figcaption>
    </figure>
  );
}
