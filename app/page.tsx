import Link from "next/link";
import { sketches } from "@/lib/sketches/registry";
import Scanlines from "@/components/Scanlines";
import GlitchTitle from "@/components/GlitchTitle";
import styles from "./page.module.css";

export default function Home() {
  const activeSketches = sketches.filter(s => s.active);

  return (
    <div className={styles.page}>
      <Scanlines />
      <div className={styles.container}>
        <header className={styles.header}>
          <GlitchTitle text="GENERATIVE NONSENSE" />
          <p className={styles.subtitle}>
            // <span className={styles.highlight}>generative</span> not generated
          </p>
          <p className={styles.subtitle}>
            // canvas experiments by <span className={styles.highlight}>kelle</span>
          </p>
        </header>

        <nav className={styles.grid}>
          {activeSketches.map(sketch => (
            <Link key={sketch.id} href={`/sketch/${sketch.slug}`} className={styles.card}>
              <span className={styles.cardId}>{sketch.id}</span>
              <span className={styles.cardTitle}>{sketch.name}</span>
              {sketch.wip && <span className={styles.cardTag}>WIP</span>}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
