"use client";
import Link from "next/link";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Download, Trash2, ArrowRight } from "lucide-react";
import { useAuth } from "@/components/providers";
import { useMemberData } from "@/hooks/use-member-data";
import { useProducts } from "@/hooks/use-products";
import { DashboardHeading } from "./dashboard-shell";
import { ProductCard, EmptyState, SkeletonGrid } from "@/components/common";
import { Button } from "@/components/ui/button";
import { downloadDocument, clearDemoData } from "@/lib/api/member.service";
import { formatDate } from "@/lib/utils";
export function SavedProducts() {
  const { saved, saveMutation } = useMemberData();
  const catalogue = useProducts();
  const products = catalogue.data ?? [];
  return (
    <>
      <DashboardHeading
        title="Saved Products"
        description="Keep useful solutions close at hand."
      />
      {saved.isPending || catalogue.isPending ? (
        <SkeletonGrid />
      ) : saved.isError || catalogue.isError ? (
        <DataError
          retry={() => {
            saved.refetch();
            catalogue.refetch();
          }}
        />
      ) : saved.data?.length ? (
        <>
          <div className="dashboard-product-grid">
            {saved.data
              .filter((id) => !products.some((p) => p.id === id))
              .map((id) => (
                <div className="form-card" key={id}>
                  <h3>Product no longer listed</h3>
                  <p>
                    This saved solution is no longer available in the current
                    catalogue.
                  </p>
                  <div className="saved-controls">
                    <button
                      disabled={saveMutation.isPending}
                      onClick={() => saveMutation.mutate({ id, isSaved: true })}
                    >
                      Remove from saved
                    </button>
                  </div>
                </div>
              ))}
            {products
              .filter((p) => saved.data.includes(p.id))
              .map((p) => (
                <div key={p.id}>
                  <ProductCard product={p} />
                  <div className="saved-controls">
                    <button
                      disabled={saveMutation.isPending}
                      onClick={() =>
                        saveMutation.mutate({ id: p.id, isSaved: true })
                      }
                    >
                      Remove from saved
                    </button>
                  </div>
                </div>
              ))}
          </div>
          {saveMutation.isError && (
            <p className="notice error" role="alert">
              {saveMutation.error.message}
            </p>
          )}
        </>
      ) : (
        <EmptyState
          title="Your shortlist starts here"
          description="Save a product from its detail page and it will appear here."
        >
          <Button asChild>
            <Link href="/dashboard/products">
              Explore Products <ArrowRight size={15} />
            </Link>
          </Button>
        </EmptyState>
      )}
    </>
  );
}
export function Quotations() {
  const { quotations } = useMemberData();
  const catalogue = useProducts();
  const products = catalogue.data ?? [];
  return (
    <>
      <DashboardHeading
        title="Quotation Requests"
        description="Track the requests you've submitted."
      />
      {quotations.isPending ? (
        <div
          className="skeleton image"
          aria-label="Loading quotations"
          role="status"
        />
      ) : quotations.isError ? (
        <DataError retry={() => quotations.refetch()} />
      ) : quotations.data?.length ? (
        <div className="dashboard-panel">
          <h2>Your RFQs</h2>
          {quotations.data.map((q) => (
            <article className="quotation-row" key={q.id}>
              <div>
                <h3>
                  {products.find((p) => p.id === q.external_product_id)?.name ??
                    q.external_product_id}
                </h3>
                <p>{q.message}</p>
                <small>
                  {formatDate(q.created_at)} · Ref {q.id.slice(0, 8)}
                </small>
              </div>
              <div>
                <span className="status-badge">{q.status}</span>
                <Link
                  className="text-link block mt-3"
                  href={`/dashboard/quotations/conversation?id=${q.id}`}
                >
                  View conversation →
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No quotation requests yet"
          description="Choose a product and tell us about your requirements."
        >
          <Button asChild>
            <Link href="/products">Find a Solution</Link>
          </Button>
        </EmptyState>
      )}
    </>
  );
}
export function Documents() {
  const { member } = useAuth();
  const { documents } = useMemberData();
  const [error, setError] = useState("");
  return (
    <>
      <DashboardHeading
        title="Technical Documents"
        description="Secure access to available product resources."
      />
      {error && (
        <div className="notice error" role="alert">
          {error}
        </div>
      )}
      {documents.isPending ? (
        <div
          className="skeleton image"
          role="status"
          aria-label="Loading documents"
        />
      ) : documents.isError ? (
        <DataError retry={() => documents.refetch()} />
      ) : documents.data?.length ? (
        <div className="dashboard-panel">
          {documents.data.map((d) => (
            <div className="dashboard-activity" key={d.id}>
              <div>
                <h3>{d.name}</h3>
                <p>{d.external_product_id}</p>
              </div>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await downloadDocument(d.storage_path);
                  } catch {
                    setError(
                      "Unable to download the document. Please try again.",
                    );
                  }
                }}
              >
                <Download size={15} /> Download
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Documents will appear here"
          description={
            member?.isDemo
              ? "No verified brochures have been supplied. Demo text overviews are available from product pages."
              : "No technical documents have been published yet. Contact the team for assistance."
          }
        >
          <Button asChild variant="outline">
            <Link href="/contact">Contact the Team</Link>
          </Button>
        </EmptyState>
      )}
    </>
  );
}
export function Messages() {
  const { messages } = useMemberData();
  return (
    <>
      <DashboardHeading
        title="Messages"
        description="Your notifications and quotation conversations."
      />
      {messages.isPending ? (
        <div
          className="skeleton image"
          role="status"
          aria-label="Loading messages"
        />
      ) : messages.isError ? (
        <DataError retry={() => messages.refetch()} />
      ) : messages.data?.length ? (
        <div className="dashboard-panel">
          {messages.data.map((m) => (
            <article className="quotation-row" key={m.id}>
              <div>
                <h3>{m.title}</h3>
                <p>{m.body}</p>
                <small>{formatDate(m.created_at)}</small>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="You're all caught up"
          description="Notifications will appear here. Open a quotation request to view or add messages."
        >
          <Button asChild variant="outline">
            <Link href="/dashboard/quotations">View Quotation Requests</Link>
          </Button>
        </EmptyState>
      )}
    </>
  );
}
export function Account() {
  const { member, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState("");
  return (
    <>
      <DashboardHeading
        title="Your Account"
        description="Member details and preview settings."
      />
      <div className="dashboard-panel">
        <h2>Account Details</h2>
        <dl className="account-details">
          {[
            ["Contact Person", member?.fullName],
            ["Email", member?.email],
            ["Business Name", member?.company ?? "Not provided"],
            [
              "Access",
              member?.isDemo ? "Demo member preview" : "Authenticated member",
            ],
          ].map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        {member?.isDemo && (
          <>
            <div className="notice mt-6">
              Demo data is stored in your browser on this device. It does not
              represent a real company account.
            </div>
            <Button
              variant="outline"
              onClick={() => {
                clearDemoData(member);
                queryClient.invalidateQueries();
                setNotice("Demo saved products and requests cleared.");
              }}
            >
              <Trash2 size={15} /> Clear Demo Data
            </Button>
          </>
        )}
        {notice && (
          <p role="status" className="notice success mt-4">
            {notice}
          </p>
        )}
        <Button className="mt-5" variant="outline" onClick={signOut}>
          Sign Out
        </Button>
      </div>
    </>
  );
}
export function DataError({ retry }: { retry: () => void }) {
  return (
    <EmptyState
      title="Unable to load your data"
      description="Please check your connection and try again."
    >
      <Button onClick={retry}>Try Again</Button>
    </EmptyState>
  );
}
