import React from "react";

// PUBLIC_INTERFACE
export function Pagination({ meta, onPrev, onNext }) {
  /** Renders simple offset-based pagination controls for Page_* responses. */
  if (!meta) return null;

  const canPrev = meta.offset > 0;
  const canNext = meta.offset + meta.limit < meta.total;

  return (
    <div className="kv-pagination" aria-label="Pagination controls">
      <button
        type="button"
        className="kv-btn"
        onClick={onPrev}
        disabled={!canPrev}
      >
        Prev
      </button>
      <span className="kv-muted">
        {meta.total === 0
          ? "0 results"
          : `${meta.offset + 1}–${Math.min(
              meta.offset + meta.limit,
              meta.total
            )} of ${meta.total}`}
      </span>
      <button
        type="button"
        className="kv-btn"
        onClick={onNext}
        disabled={!canNext}
      >
        Next
      </button>
    </div>
  );
}
