import Link from "next/link";
import { sketches } from "@/lib/sketches/registry";

export default function Home() {
  const activeSketches = sketches.filter(s => s.active);

  return (
    <div className="container">
      <header>
        <h1 className="glitch" data-text="GENERATIVE NONSENSE">
          GENERATIVE NONSENSE
        </h1>
        <p className="subtitle">
          // canvas experiments by <span className="highlight">Kelle</span>
        </p>
      </header>

      <nav className="experiment-grid">
        {activeSketches.map(sketch => (
          <Link key={sketch.id} href={`/sketch/${sketch.slug}`} className="card">
            <span className="card-id">{sketch.id}</span>
            <span className="card-title">{sketch.name}</span>
            {sketch.wip && <span className="card-tag">WIP</span>}
          </Link>
        ))}
      </nav>
    </div>
  );
}
