import Image from "@/components/ui/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updates } from "@/data/updates";
import { formatDate } from "@/lib/utils";
export function generateStaticParams() {
  return updates.map((a) => ({ slug: a.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = updates.find((a) => a.slug === slug);
  return { title: article?.title, description: article?.excerpt };
}
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = updates.find((a) => a.slug === slug);
  if (!article) notFound();
  return (
    <article className="container section article">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/updates">Latest Updates</Link>
        <span>/</span>
        <span>{article.category}</span>
      </nav>
      <span className="eyebrow">{article.category}</span>
      <h1>{article.title}</h1>
      <time dateTime={article.date} className="demo-caption">
        {formatDate(article.date)} · Prototype editorial example
      </time>
      <div className="article-image">
        <Image
          src={article.image}
          alt="Illustrative water treatment story"
          fill
          sizes="(max-width:800px) 90vw, 780px"
          priority
        />
      </div>
      <div className="notice">
        This is illustrative prototype content. It does not describe a verified
        company project or announcement.
      </div>
      <div className="article-content">
        {article.content.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
      <Link href="/updates" className="text-link mt-8">
        ← Back to Latest Updates
      </Link>
    </article>
  );
}
