"use client";
import { useState } from "react";
import { updates, newsCategories } from "@/data/updates";
import { NewsCard, EmptyState } from "@/components/common";
export function UpdatesList() {
  const [category, setCategory] = useState("All");
  const articles = updates.filter(
    (a) => category === "All" || a.category === category,
  );
  return (
    <>
      <div className="filter-chips" style={{ marginBottom: 25 }}>
        {newsCategories.map((c) => (
          <button
            className={`chip ${category === c ? "active" : ""}`}
            key={c}
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
          >
            {c}
          </button>
        ))}
      </div>
      <p className="demo-caption" style={{ marginBottom: 18 }}>
        Prototype editorial examples · These stories are illustrative and do not
        announce real company projects.
      </p>
      {articles.length ? (
        <div className="news-grid">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No updates yet"
          description="Check back for new stories in this category."
        />
      )}
    </>
  );
}
