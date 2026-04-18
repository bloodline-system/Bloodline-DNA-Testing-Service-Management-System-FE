/**
 * Utility to dynamically update meta tags for social media sharing
 */

interface MetaTagsConfig {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

const DEFAULT_META = {
  title: "Bloodline DNA - Testing Service Management",
  description:
    "Manage and share DNA testing services with featured content and insights",
  image: "/toggle-logo.png",
  url: typeof window !== "undefined" ? window.location.href : "",
  type: "website",
};

/**
 * Update Open Graph and Twitter Card meta tags
 */
export const updateMetaTags = (config: MetaTagsConfig) => {
  const meta = { ...DEFAULT_META, ...config };

  // Update or create og:title
  updateOrCreateMetaTag("og:title", meta.title, "property");

  // Update or create og:description
  updateOrCreateMetaTag("og:description", meta.description, "property");

  // Update or create og:image
  updateOrCreateMetaTag("og:image", meta.image, "property");

  // Update or create og:url
  updateOrCreateMetaTag("og:url", meta.url || window.location.href, "property");

  // Update or create og:type
  updateOrCreateMetaTag("og:type", meta.type, "property");

  // Twitter Card tags
  updateOrCreateMetaTag("twitter:card", "summary_large_image", "name");
  updateOrCreateMetaTag("twitter:title", meta.title, "name");
  updateOrCreateMetaTag("twitter:description", meta.description, "name");
  updateOrCreateMetaTag("twitter:image", meta.image, "name");

  // Update document title
  if (meta.title) {
    document.title = meta.title;
  }
};

/**
 * Helper to update or create a meta tag
 */
const updateOrCreateMetaTag = (
  name: string,
  content: string,
  attribute: "property" | "name",
) => {
  let tag = document.querySelector(`meta[${attribute}="${name}"]`);

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, name);
    document.head.appendChild(tag);
  }

  tag.setAttribute("content", content);
};

/**
 * Reset meta tags to defaults
 */
export const resetMetaTags = () => {
  updateMetaTags({});
};
