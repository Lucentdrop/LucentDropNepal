import Image from "@/components/ui/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  MapPin,
  Clock,
  HeartHandshake,
  LockKeyhole,
} from "lucide-react";
import { stats } from "@/data/services";
import type { Product, NewsArticle } from "@/types";
import { formatDate } from "@/lib/utils";
export function PageBanner({
  eyebrow,
  title,
  description,
  image = "/images/hero.webp",
}: {
  eyebrow?: React.ReactNode;
  title: string;
  description: string;
  image?: string;
}) {
  return (
    <section className="page-banner">
      <Image
        src={image}
        alt="Illustrative Nepal water infrastructure"
        fill
        priority
        sizes="100vw"
      />
      <div className="container banner-content">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  );
}
export function SectionHeading({
  eyebrow,
  title,
  description,
  link,
  href,
}: {
  eyebrow?: React.ReactNode;
  title: string;
  description?: string;
  link?: string;
  href?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {link && href && (
        <Link className="text-link" href={href}>
          {link}
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}
const statIcons = [BadgeCheck, MapPin, Clock, HeartHandshake];
export function Stats() {
  return (
    <div className="stats-grid">
      {stats.map((stat, i) => {
        const Icon = statIcons[i];
        return (
          <div className="stat-card" key={stat.label}>
            <span className="soft-icon">
              <Icon size={24} />
            </span>
            <div>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
export function ProductCard({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  return (
    <article className={`product-card ${compact ? "compact" : ""}`}>
      <Link href={`/products/${product.slug}`} className="product-image">
        <Image
          src={product.image}
          alt={`Illustrative ${product.name}`}
          fill
          sizes="(max-width: 600px) 90vw, (max-width: 1000px) 45vw, 25vw"
        />
      </Link>
      <div className="product-card-body">
        <span className="tag">{product.tag}</span>
        <Link href={`/products/${product.slug}`}>
          <h3>{product.name}</h3>
        </Link>
        {!compact && <p>{product.summary}</p>}
        <Link
          className="product-details-link"
          href={`/products/${product.slug}`}
        >
          <LockKeyhole size={13} /> View product details{" "}
          <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}
export function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <article className="news-card">
      <Link href={`/updates/${article.slug}`} className="news-image">
        <Image
          src={article.image}
          alt="Illustrative water solution story"
          fill
          sizes="(max-width:768px) 90vw, 33vw"
        />
      </Link>
      <div className="news-card-body">
        <span className="eyebrow small">{article.category}</span>
        <Link href={`/updates/${article.slug}`}>
          <h3>{article.title}</h3>
        </Link>
        <p>{article.excerpt}</p>
        <div className="news-meta">
          <time dateTime={article.date}>{formatDate(article.date)}</time>
          <Link
            href={`/updates/${article.slug}`}
            aria-label={`Read ${article.title}`}
          >
            <ArrowUpRightIcon />
          </Link>
        </div>
      </div>
    </article>
  );
}
function ArrowUpRightIcon() {
  return <ArrowRight size={17} />;
}
export function SkeletonGrid() {
  return (
    <div className="product-grid" aria-label="Loading products" role="status">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div className="skeleton-card" key={i}>
          <div className="skeleton image" />
          <div className="skeleton line" />
          <div className="skeleton line short" />
        </div>
      ))}
    </div>
  );
}
export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <DropletShape />
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}
function DropletShape() {
  return (
    <span className="soft-icon">
      <LockKeyhole size={24} />
    </span>
  );
}
