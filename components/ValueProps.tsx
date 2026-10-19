import type { SiteContent } from "@/lib/site-content";

function ValueIcon({ type }: { type: "globe" | "shield" | "truck" }) {
  if (type === "globe") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="19" />
        <ellipse cx="24" cy="24" rx="9" ry="19" />
        <path d="M6 17h36M6 31h36M24 5v38" />
      </svg>
    );
  }
  if (type === "shield") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M24 4 41 11v12c0 11-7 17-17 22C14 40 7 34 7 23V11l17-7Z" />
        <path d="m16 24 6 6 11-13" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M4 10h25v25H4zM29 19h9l7 8v8H29z" />
      <circle cx="14" cy="38" r="5" />
      <circle cx="36" cy="38" r="5" />
      <path d="M33 19v9h12" />
    </svg>
  );
}

export function ValueProps({ values }: { values: SiteContent["values"] }) {
  return (
    <section className="value-props" aria-label="Our commitments">
      {values.map((value) => (
        <div className="value-item" key={value.title}>
          <div className="value-content">
            <span className="value-icon">
              <ValueIcon type={value.icon} />
            </span>
            <span className="value-copy">
              <strong className="value-title">{value.title}</strong>
              <span className="value-caption">{value.caption}</span>
            </span>
          </div>
        </div>
      ))}
    </section>
  );
}
