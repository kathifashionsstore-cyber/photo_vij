import { useEffect } from 'react';

const ensureMeta = (selector, createAttrs) => {
  let element = document.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    Object.entries(createAttrs).forEach(([key, value]) => element.setAttribute(key, value));
    document.head.appendChild(element);
  }
  return element;
};

export const SEOHead = ({ title, description }) => {
  useEffect(() => {
    const fullTitle = title ? `${title} | Snaplica Photography Vijayawada` : 'Snaplica Photography Vijayawada';

    if (title) {
      document.title = fullTitle;
    }
    
    if (description) {
      ensureMeta('meta[name="description"]', { name: 'description' }).setAttribute('content', description);
      ensureMeta('meta[property="og:description"]', { property: 'og:description' }).setAttribute('content', description);
    }

    ensureMeta('meta[property="og:title"]', { property: 'og:title' }).setAttribute('content', fullTitle);
    ensureMeta('meta[property="og:image"]', { property: 'og:image' }).setAttribute('content', '/logo.webp');
    ensureMeta('meta[name="twitter:card"]', { name: 'twitter:card' }).setAttribute('content', 'summary_large_image');
    ensureMeta('meta[name="twitter:image"]', { name: 'twitter:image' }).setAttribute('content', '/logo.webp');
  }, [title, description]);

  return null;
};

export default SEOHead;
