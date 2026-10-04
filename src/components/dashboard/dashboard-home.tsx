"use client";
import Link from "next/link";
import Image from "@/components/ui/image";
import {
  Heart,
  FileText,
  ClipboardList,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { DashboardHeading } from "./dashboard-shell";
import { useAuth } from "@/components/providers";
import { useMemberData } from "@/hooks/use-member-data";
import { useProducts } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
export function DashboardHome() {
  const { member } = useAuth();
  const catalogue = useProducts();
  const { saved, quotations, documents, messages } = useMemberData();
  const stats = [
    {
      icon: Heart,
      name: "Saved Products",
      value: saved.data?.length,
      href: "/dashboard/saved-products",
      error: saved.isError,
    },
    {
      icon: FileText,
      name: "Documents",
      value: documents.data?.length,
      href: "/dashboard/documents",
      error: documents.isError,
    },
    {
      icon: ClipboardList,
      name: "Open Quotations",
      value: quotations.data?.filter((q) => q.status !== "closed").length,
      href: "/dashboard/quotations",
      error: quotations.isError,
    },
    {
      icon: MessageSquare,
      name: "Messages",
      value: messages.data?.length,
      href: "/dashboard/messages",
      error: messages.isError,
    },
  ];
  return (
    <>
      <DashboardHeading
        title="Dashboard"
        description={`Welcome, ${member?.fullName}. Your water solutions workspace.`}
      />
      <div className="dashboard-stats">
        {stats.map((s) => (
          <Link href={s.href} key={s.name} className="dashboard-stat">
            <s.icon size={20} />
            <strong>{s.error ? "—" : (s.value ?? "…")}</strong>
            <span>{s.error ? "Unable to load" : s.name}</span>
          </Link>
        ))}
      </div>
      <div className="dashboard-panel">
        <h2>Explore Featured Solutions</h2>
        {catalogue.isPending && (
          <p role="status">Loading featured solutions…</p>
        )}
        {catalogue.isError && (
          <div className="notice error">
            Unable to load products.{" "}
            <button className="text-link" onClick={() => catalogue.refetch()}>
              Retry
            </button>
          </div>
        )}
        {catalogue.data?.length === 0 && <p>No products are available yet.</p>}
        {catalogue.data?.slice(0, 3).map((p) => (
          <div key={p.id} className="dashboard-activity">
            <Link href={`/products/${p.slug}`} className="activity-image">
              <Image src={p.image} alt="" fill sizes="66px" />
            </Link>
            <div>
              <h3>{p.name}</h3>
              <p>{p.summary}</p>
            </div>
            <Link href={`/products/${p.slug}`} aria-label={`View ${p.name}`}>
              <ArrowRight size={18} />
            </Link>
          </div>
        ))}
      </div>
      <div className="dashboard-tip">
        <div>
          <h3>Have a project in mind?</h3>
          <p>
            Explore the catalogue and request a quotation from any product page.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/products">
            Explore Products <ArrowRight size={15} />
          </Link>
        </Button>
      </div>
    </>
  );
}
