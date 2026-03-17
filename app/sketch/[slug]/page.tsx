import { sketches } from "@/lib/sketches/registry";
import SketchLoader from "@/components/SketchLoader";

export function generateStaticParams() {
  return sketches.map(s => ({ slug: s.slug }));
}

export default async function SketchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <SketchLoader slug={slug} />;
}
