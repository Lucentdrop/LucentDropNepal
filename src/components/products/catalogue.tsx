"use client";
import { useState, useEffect } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { productCategories } from "@/data/products";
import { ProductCard, SkeletonGrid, EmptyState } from "@/components/common";
import { Button } from "@/components/ui/button";
export function Catalogue() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const { data, isPending, isError, refetch } = useProducts();
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("search"))
      document.getElementById("product-search")?.focus();
  }, []);
  const filtered = data?.filter(
    (p) =>
      (category === "All" || p.category === category) &&
      `${p.name} ${p.summary} ${p.category}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <>
      <div className="catalogue-tools">
        <label className="search-field" htmlFor="product-search">
          <Search size={16} />
          <input
            id="product-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products, categories or solutions…"
            aria-label="Search products"
          />
        </label>
        <div className="filter-chips" aria-label="Product categories">
          {productCategories.map((c) => (
            <button
              className={`chip ${category === c ? "active" : ""}`}
              key={c}
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      {isPending ? (
        <SkeletonGrid />
      ) : isError ? (
        <EmptyState
          title="Unable to load products"
          description="The product service is currently unavailable."
        >
          <Button onClick={() => refetch()}>Try again</Button>
        </EmptyState>
      ) : (
        <>
          <div className="catalogue-info">
            <span aria-live="polite">
              {filtered?.length}{" "}
              {filtered?.length === 1 ? "solution" : "solutions"} found
            </span>
            <span>
              <SlidersHorizontal
                size={12}
                style={{ display: "inline", marginRight: 5 }}
              />{" "}
              Public summaries · Member technical details
            </span>
          </div>
          {filtered?.length ? (
            <div className="product-grid">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No matching products"
              description="Try another keyword or choose a different category."
            >
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                }}
              >
                Clear filters
              </Button>
            </EmptyState>
          )}
        </>
      )}
      <p className="demo-caption">
        Illustrative catalogue and product images. Final specifications are
        confirmed during consultation.
      </p>
    </>
  );
}
