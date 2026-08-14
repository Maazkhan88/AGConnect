"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";

const LINKS = [
  { label: "Platform", href: "#platform" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "For Employees", href: "#for-employees" },
  { label: "For Administrators", href: "#for-administrators" },
];

/**
 * Public site navigation. Uses a real <button aria-expanded> rather than a
 * CSS-only checkbox so the mobile drawer exposes its state to assistive
 * technology; Escape closes it and focus styles are never suppressed.
 */
export function SiteNav({ profileHref }: { profileHref: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="hp-nav-toggle"
        aria-expanded={open}
        aria-controls="site-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
      </button>

      {open && (
        <button
          type="button"
          className="hp-nav-backdrop"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      )}

      <nav id="site-nav" className={`hp-nav${open ? " is-open" : ""}`} aria-label="Primary">
        <div className="hp-nav-links">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
          <a href="https://www.agholding.ae/" target="_blank" rel="noreferrer">
            AG Holding
            <ArrowUpRight size={14} aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
        <div className="hp-nav-actions">
          <Link className="button small" href={profileHref} onClick={() => setOpen(false)}>
            View live profile
          </Link>
          <Link className="text-link" href="/admin/login" onClick={() => setOpen(false)}>
            Admin login
          </Link>
        </div>
      </nav>
    </>
  );
}
