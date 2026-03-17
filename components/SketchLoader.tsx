"use client";

import { useEffect, useState } from "react";
import SketchCanvas from "@/components/SketchCanvas";
import type { SketchSettings, SketchFn } from "@/lib/types";
import styles from "./SketchLoader.module.css";

const sketchModules: Record<string, () => Promise<{ settings: SketchSettings; sketch: SketchFn }>> = {
  zigzags: () => import("@/lib/sketches/zigzags"),
  zigzags2: () => import("@/lib/sketches/zigzags2"),
  circles: () => import("@/lib/sketches/circles"),
  circleGrid: () => import("@/lib/sketches/circleGrid"),
  starchart: () => import("@/lib/sketches/starchart"),
  nightsky: () => import("@/lib/sketches/nightsky"),
  dispersion: () => import("@/lib/sketches/dispersion"),
  dispersion2: () => import("@/lib/sketches/dispersion2"),
  dispersion3: () => import("@/lib/sketches/dispersion3"),
  randomWalk: () => import("@/lib/sketches/randomWalk"),
  gordonWaltersKoru: () => import("@/lib/sketches/gordonWaltersKoru"),
  flare: () => import("@/lib/sketches/flare"),
  unicode: () => import("@/lib/sketches/unicode"),
};

interface Props {
  slug: string;
}

export default function SketchLoader({ slug }: Props) {
  const [mod, setMod] = useState<{ settings: SketchSettings; sketch: SketchFn } | null>(null);

  useEffect(() => {
    const loader = sketchModules[slug];
    if (loader) {
      loader().then(setMod);
    }
  }, [slug]);

  if (!sketchModules[slug]) {
    return <div className={styles.message}>Sketch not found: {slug}</div>;
  }

  if (!mod) {
    return <div className={styles.message}>Loading...</div>;
  }

  return (
    <div className={styles.wrapper}>
      <SketchCanvas settings={mod.settings} sketch={mod.sketch} />
    </div>
  );
}
