"use client";
import Image from "@/components/ui/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as Tabs from "@radix-ui/react-tabs";
import {
  CheckCircle2,
  Download,
  LockKeyhole,
  Heart,
  ArrowRight,
  X,
  FileText,
} from "lucide-react";
import { useAuth } from "@/components/providers";
import { useMemberData } from "@/hooks/use-member-data";
import { loadProductDetail } from "@/lib/api/products.service";
import { downloadDocument } from "@/lib/api/member.service";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";
import { useProducts } from "@/hooks/use-products";
import { EmptyState } from "@/components/common";
export function ProductDetail({
  product: initialProduct,
}: {
  product: Product;
}) {
  const catalogue = useProducts();
  const product =
    catalogue.data?.find((p) => p.slug === initialProduct.slug) ??
    initialProduct;
  const { member, loading } = useAuth();
  const { saved, saveMutation, quotationMutation, documents } = useMemberData();
  const [view, setView] = useState(0);
  const [rfq, setRfq] = useState(false);
  const closeRfq = useCallback(() => setRfq(false), []);
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const detail = useQuery({
    queryKey: ["product-detail", product.id, member?.id],
    queryFn: () => loadProductDetail(product.id, member!),
    enabled:
      !!member &&
      catalogue.isSuccess &&
      catalogue.data.some((p) => p.slug === initialProduct.slug),
  });
  const isSaved = saved.data?.includes(product.id) ?? false;
  const brochure = documents.data?.find(
    (d) => d.external_product_id === product.id,
  );
  async function download() {
    setNotice("");
    try {
      if (member?.isDemo) {
        const blob = new Blob(
          [
            `LUCENT DROP NEPAL — PROTOTYPE PRODUCT OVERVIEW\n\n${product.name}\n${product.summary}\n\n${detail.data?.description ?? ""}\n\nIllustrative data only. Not a technical brochure. Final specifications require consultation.`,
          ],
          { type: "text/plain" },
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${product.slug}-demo-overview.txt`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setNotice(
          "Downloaded an illustrative text overview. A verified PDF brochure has not been supplied.",
        );
      } else if (brochure) await downloadDocument(brochure.storage_path);
      else
        setNotice(
          "No brochure has been uploaded for this product yet. Contact us for details.",
        );
    } catch {
      setNotice("Unable to download this document. Please try again.");
    }
  }
  if (catalogue.isPending)
    return (
      <div
        className="skeleton image"
        role="status"
        aria-label="Loading product"
      />
    );
  if (catalogue.isError)
    return (
      <EmptyState
        title="Unable to load product"
        description="Please try the product service again."
      >
        <Button onClick={() => catalogue.refetch()}>Try Again</Button>
      </EmptyState>
    );
  if (!catalogue.data.some((p) => p.slug === initialProduct.slug))
    return (
      <EmptyState
        title="Product no longer available"
        description="Return to the catalogue to find another solution."
      >
        <Button asChild>
          <Link href="/products">View Products</Link>
        </Button>
      </EmptyState>
    );
  return (
    <>
      <div className="breadcrumbs">
        <Link href="/products">Products</Link>
        <span>›</span>
        <span>{product.name}</span>
      </div>
      <div className="product-detail-grid">
        <div>
          <div className="detail-main-image">
            <Image
              style={{
                transform:
                  view === 1
                    ? "scale(1.2)"
                    : view === 2
                      ? "scale(.85)"
                      : "none",
              }}
              src={product.image}
              alt={`Illustrative ${product.name}, ${["standard view", "closer view", "full view"][view]}`}
              fill
              sizes="(max-width:600px) 90vw, 40vw"
              priority
            />
          </div>
          <div className="gallery-thumbs">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                aria-pressed={view === i}
                aria-label={`Show ${["standard", "closer", "full"][i]} illustrative view`}
                onClick={() => setView(i)}
              >
                <Image
                  src={product.image}
                  alt=""
                  fill
                  sizes="80px"
                  style={{
                    transform:
                      i === 1 ? "scale(1.2)" : i === 2 ? "scale(.8)" : "none",
                  }}
                />
              </button>
            ))}
          </div>
          <p className="demo-caption">
            Illustrative product render · Not a verified product photograph
          </p>
        </div>
        <div className="product-detail">
          <h1>{product.name}</h1>
          <div className="detail-tags">
            <span className="tag">{product.tag}</span>
            <span className="tag">{product.category}</span>
          </div>
          <p className="description">{product.summary}</p>
          {loading ? (
            <div className="skeleton image mt-5" />
          ) : !member ? (
            <div className="login-gate">
              <span className="soft-icon">
                <LockKeyhole size={25} />
              </span>
              <h2>More details. Better decisions.</h2>
              <p>
                Sign in to explore specifications, application guidance and
                available technical documents, or request a quotation.
              </p>
              <div className="gate-actions">
                <Button asChild>
                  <Link href={`/login?next=/products/${product.slug}`}>
                    Sign In to View Details <ArrowRight size={15} />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/signup">Create Account</Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              {member.isDemo && (
                <div className="notice mt-4">
                  Demo member preview · Specifications are illustrative. No real
                  technical data or confidential documents are included.
                </div>
              )}
              <div className="detail-actions">
                <Button variant="outline" onClick={download}>
                  <Download size={15} />{" "}
                  {member.isDemo ? "Demo Overview" : "Download Brochure"}
                </Button>
                <Button
                  onClick={() => {
                    quotationMutation.reset();
                    setMessage("");
                    setRfq(true);
                  }}
                >
                  Request a Quotation
                </Button>
                <Button
                  variant="outline"
                  disabled={
                    saveMutation.isPending || saved.isPending || saved.isError
                  }
                  onClick={() =>
                    saveMutation.mutate({ id: product.id, isSaved })
                  }
                  aria-pressed={isSaved}
                >
                  <Heart size={15} fill={isSaved ? "currentColor" : "none"} />
                  {isSaved ? "Saved" : "Save"}
                </Button>
              </div>
              {saveMutation.isError && (
                <p role="alert" className="notice error">
                  {saveMutation.error.message}
                </p>
              )}
              {notice && (
                <p className="notice" role="status">
                  {notice}
                </p>
              )}
              {detail.isPending ? (
                <div className="skeleton image" />
              ) : detail.isError ? (
                <div className="notice error" role="alert">
                  Unable to load technical details.{" "}
                  <button
                    onClick={() => detail.refetch()}
                    className="text-link"
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <Tabs.Root defaultValue="overview">
                  <Tabs.List
                    className="tabs-list"
                    aria-label="Product information"
                  >
                    {[
                      "Overview",
                      "Specifications",
                      "Applications",
                      "Documents",
                    ].map((t) => (
                      <Tabs.Trigger
                        key={t}
                        value={t.toLowerCase()}
                        className="tab-trigger"
                      >
                        {t}
                      </Tabs.Trigger>
                    ))}
                  </Tabs.List>
                  <Tabs.Content value="overview">
                    <p className="description">{detail.data.description}</p>
                    <ul className="feature-list">
                      {detail.data.features.map((f) => (
                        <li key={f}>
                          <CheckCircle2 size={16} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </Tabs.Content>
                  <Tabs.Content value="specifications">
                    <table className="spec-table">
                      <caption className="sr-only">
                        Product specifications
                      </caption>
                      <tbody>
                        {detail.data.specifications.map((s) => (
                          <tr key={s.label}>
                            <th scope="row">{s.label}</th>
                            <td>{s.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="demo-caption">
                      Demo values. Confirm final specifications with the team.
                    </p>
                  </Tabs.Content>
                  <Tabs.Content value="applications">
                    <ul className="feature-list">
                      {detail.data.applications.map((a) => (
                        <li key={a}>
                          <CheckCircle2 size={16} />
                          {a}
                        </li>
                      ))}
                    </ul>
                  </Tabs.Content>
                  <Tabs.Content value="documents">
                    {documents.isPending ? (
                      <p role="status">Loading documents…</p>
                    ) : documents.isError ? (
                      <div className="notice error">
                        Unable to load documents.{" "}
                        <button
                          className="text-link"
                          onClick={() => documents.refetch()}
                        >
                          Retry
                        </button>
                      </div>
                    ) : brochure ? (
                      <Button variant="outline" onClick={download}>
                        <FileText size={15} />
                        {brochure.name}
                      </Button>
                    ) : (
                      <div className="notice">
                        No verified technical documents have been uploaded yet.
                        Request a quotation for product guidance.
                      </div>
                    )}
                  </Tabs.Content>
                </Tabs.Root>
              )}
            </>
          )}
        </div>
      </div>
      {rfq && (
        <QuotationDialog
          product={product}
          message={message}
          setMessage={setMessage}
          close={closeRfq}
          mutation={quotationMutation}
          demo={!!member?.isDemo}
        />
      )}
    </>
  );
}
function QuotationDialog({
  product,
  message,
  setMessage,
  close,
  mutation,
  demo,
}: {
  product: Product;
  message: string;
  setMessage: (m: string) => void;
  close: () => void;
  mutation: ReturnType<typeof useMemberData>["quotationMutation"];
  demo: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current;
    dialog?.querySelector<HTMLElement>("button")?.focus();
    function keys(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const elements = dialog?.querySelectorAll<HTMLElement>(
          "button:not(:disabled),textarea,a[href]",
        );
        if (!elements?.length) return;
        const first = elements[0],
          last = elements[elements.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", keys);
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", keys);
      document.body.style.overflow = oldOverflow;
      previous?.focus();
    };
  }, [close]);
  return (
    <div
      className="rfq-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={ref}
        className="form-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rfq-title"
      >
        <div className="modal-heading">
          <h2 id="rfq-title">Request a Quotation</h2>
          <button
            className="icon-button"
            aria-label="Close quotation form"
            onClick={close}
          >
            <X size={20} />
          </button>
        </div>
        <p>{product.name}</p>
        {demo && (
          <div className="notice">
            Demo request: saved on this device only. No enquiry is sent to
            Lucent Drop Nepal.
          </div>
        )}
        {mutation.isSuccess ? (
          <>
            <div className="notice success" role="status">
              {demo ? "Demo quotation saved." : "Quotation request submitted."}{" "}
              View it in your member dashboard.
            </div>
            <Button asChild>
              <Link href="/dashboard/quotations" onClick={close}>
                View My Requests
              </Link>
            </Button>
          </>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate({ id: product.id, message });
            }}
          >
            <div className="field">
              <label htmlFor="rfq-message">Your requirements *</label>
              <textarea
                id="rfq-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                minLength={10}
                maxLength={3000}
                placeholder="Tell us about capacity, application, location and any specific requirements…"
              />
            </div>
            {mutation.isError && (
              <div className="notice error mt-4" role="alert">
                {mutation.error.message}
              </div>
            )}
            <Button
              className="mt-5"
              type="submit"
              disabled={mutation.isPending}
            >
              {mutation.isPending
                ? "Submitting…"
                : demo
                  ? "Save Demo Request"
                  : "Submit Request"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
