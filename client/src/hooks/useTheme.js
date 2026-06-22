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

export function useDynamicTheme() {
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "theme"), (snap) => {
      const theme = { ...DEFAULT_THEME, ...(snap.exists() ? snap.data() : {}) };
      applyTheme(theme);
    });
    return unsub;
  }, []);
}

function applyTheme(theme) {
  const root = document.documentElement;
  root.style.setProperty("--color-primary",      theme.colorPrimary);
  root.style.setProperty("--color-primary-dark",  theme.colorPrimaryDark);
  root.style.setProperty("--color-accent",        theme.colorAccent);
  root.style.setProperty("--color-bg",            theme.colorBg);
  root.style.setProperty("--color-surface",       theme.colorSurface);
  root.style.setProperty("--color-border",        theme.colorBorder);
  root.style.setProperty("--color-text",          theme.colorText);
  root.style.setProperty("--color-text-muted",    theme.colorTextMuted);
  root.style.setProperty("--color-success",       theme.colorSuccess);
  root.style.setProperty("--color-warning",       theme.colorWarning);
  root.style.setProperty("--color-danger",        theme.colorDanger);
  root.style.setProperty("--color-info",          theme.colorInfo);
  root.style.setProperty("--public-bg",           theme.publicBg);
  root.style.setProperty("--public-text",         theme.publicText);
  root.style.setProperty("--public-primary",      theme.publicPrimary);
  root.style.setProperty("--border-radius",       theme.borderRadius + "px");
  
  // Google Fonts dynamic load
  const fontLinkId = "dynamic-theme-fonts";
  let fontLink = document.getElementById(fontLinkId);
  if (!fontLink) {
    fontLink = document.createElement("link");
    fontLink.id = fontLinkId;
    fontLink.rel = "stylesheet";
    document.head.appendChild(fontLink);
  }
  const headingFont = (theme.fontHeading || "Playfair Display").replace(/ /g, "+");
  const bodyFont = (theme.fontBody || "Inter").replace(/ /g, "+");
  fontLink.href = `https://fonts.googleapis.com/css2?family=${headingFont}:wght@300;400;600;700&family=${bodyFont}:wght@300;400;500;600;700&display=swap`;
  root.style.setProperty("--font-heading", `'${theme.fontHeading}', serif`);
  root.style.setProperty("--font-body", `'${theme.fontBody}', sans-serif`);
}
