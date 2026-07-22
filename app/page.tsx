import Link from "next/link";
import { sketches } from "@/lib/sketches/registry";
import styles from "./page.module.css";

export default function Home() {
  const activeSketches = sketches.filter(s => s.active);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Procedural Nonsense</h1>
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
