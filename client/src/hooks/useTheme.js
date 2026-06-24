import { useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const DEFAULT_THEME = {
  colorPrimary:     "#c9a227",  // Gold
  colorPrimaryDark: "#a07e15",
  colorAccent:      "#e8593c",  // Coral CTA
  colorBg:          "#060608",  // Near black
  colorSurface:     "#0f0f12",  // Card bg
  colorBorder:      "rgba(255,255,255,0.08)",
  colorText:        "#ffffff",
  colorTextMuted:   "rgba(255,255,255,0.45)",
  colorSuccess:     "#22c55e",
  colorWarning:     "#f59e0b",
  colorDanger:      "#ef4444",
  colorInfo:        "#3b82f6",
  // Public site
  publicBg:         "#ffffff",
  publicText:       "#1a1a1a",
  publicPrimary:    "#c9a227",
  publicAccent:     "#1a1a2e",
  fontHeading:      "Playfair Display",
  fontBody:         "Inter",
  borderRadius:     "12",       // px
  animationSpeed:   "normal",   // slow | normal | fast
};

const hexToRgbParts = (value, fallback) => {
  const hex = String(value || "").replace("#", "").trim();
  if (!/^[0-9a-f]{6}$/i.test(hex)) return fallback;
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
  ].join(" ");
};

export function useDynamicTheme() {
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "theme"), (snap) => {
      const theme = { ...DEFAULT_THEME, ...(snap.exists() ? snap.data() : {}) };
      applyTheme(theme);
    });
    return unsub;
  }, []);
}

export function applyTheme(theme) {
  const mergedTheme = { ...DEFAULT_THEME, ...theme };
  const root = document.documentElement;
  root.style.setProperty("--color-primary",      mergedTheme.colorPrimary);
  root.style.setProperty("--color-primary-dark",  mergedTheme.colorPrimaryDark);
  root.style.setProperty("--color-accent",        mergedTheme.colorAccent);
  root.style.setProperty("--color-bg",            mergedTheme.colorBg);
  root.style.setProperty("--color-surface",       mergedTheme.colorSurface);
  root.style.setProperty("--color-border",        mergedTheme.colorBorder);
  root.style.setProperty("--color-text",          mergedTheme.colorText);
  root.style.setProperty("--color-text-muted",    mergedTheme.colorTextMuted);
  root.style.setProperty("--color-success",       mergedTheme.colorSuccess);
  root.style.setProperty("--color-warning",       mergedTheme.colorWarning);
  root.style.setProperty("--color-danger",        mergedTheme.colorDanger);
  root.style.setProperty("--color-info",          mergedTheme.colorInfo);
  root.style.setProperty("--public-bg",           mergedTheme.publicBg);
  root.style.setProperty("--public-text",         mergedTheme.publicText);
  root.style.setProperty("--public-primary",      mergedTheme.publicPrimary);
  root.style.setProperty("--border-radius",       `${mergedTheme.borderRadius}px`);
  root.style.setProperty("--brand-gold-rgb",      hexToRgbParts(mergedTheme.colorPrimary, "201 162 39"));
  root.style.setProperty("--brand-amber-rgb",     hexToRgbParts(mergedTheme.colorPrimaryDark, "245 158 11"));
  root.style.setProperty("--brand-dark-rgb",      hexToRgbParts(mergedTheme.colorBg, "10 10 10"));
  root.style.setProperty("--brand-card-rgb",      hexToRgbParts(mergedTheme.colorSurface, "18 18 18"));
  
  // Google Fonts dynamic load
  const fontLinkId = "dynamic-theme-fonts";
  let fontLink = document.getElementById(fontLinkId);
  if (!fontLink) {
    fontLink = document.createElement("link");
    fontLink.id = fontLinkId;
    fontLink.rel = "stylesheet";
    document.head.appendChild(fontLink);
  }
  const headingFont = (mergedTheme.fontHeading || "Playfair Display").replace(/ /g, "+");
  const bodyFont = (mergedTheme.fontBody || "Inter").replace(/ /g, "+");
  fontLink.href = `https://fonts.googleapis.com/css2?family=${headingFont}:wght@300;400;600;700&family=${bodyFont}:wght@300;400;500;600;700&display=swap`;
  root.style.setProperty("--font-heading", `'${mergedTheme.fontHeading}', serif`);
  root.style.setProperty("--font-body", `'${mergedTheme.fontBody}', sans-serif`);
}
