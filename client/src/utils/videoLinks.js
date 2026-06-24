export const toEmbeddableVideo = (rawUrl = "") => {
  const value = rawUrl.trim();
  if (!value) return null;

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.replace("/", "");
      return id ? { provider: "youtube", embedUrl: `https://www.youtube.com/embed/${id}`, originalUrl: value } : null;
    }

    if (host.includes("youtube.com")) {
      const id = url.searchParams.get("v") || url.pathname.match(/\/(shorts|embed)\/([^/?]+)/)?.[2];
      return id ? { provider: "youtube", embedUrl: `https://www.youtube.com/embed/${id}`, originalUrl: value } : null;
    }

    if (host.includes("vimeo.com")) {
      const id = url.pathname.split("/").filter(Boolean).pop();
      return id ? { provider: "vimeo", embedUrl: `https://player.vimeo.com/video/${id}`, originalUrl: value } : null;
    }
  } catch {
    return null;
  }

  return null;
};
