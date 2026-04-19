/**
 * Dữ liệu test unique — bám enum services/post/types (category, status, tags).
 */

export const DEFAULT_CATEGORY = "TESTING_GUIDE";
export const ALT_CATEGORY = "NEWS";

/** @param {string} suffix */
export function buildPostTitle(suffix) {
  return `E2E_POST_${suffix}`;
}

/** @param {string} suffix */
export function buildUpdatedTitle(suffix) {
  return `E2E_POST_UPDATED_${suffix}`;
}

/**
 * Nội dung đủ dài để nhận diện trong preview card (line-clamp).
 * @param {string} suffix
 */
export function buildPostContent(suffix) {
  return `E2E long content block for recognition. Suffix=${suffix}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.`;
}

/**
 * @param {object} opts
 * @param {string} opts.suffix
 * @param {string} [opts.title]
 * @param {string} [opts.content]
 * @param {string} [opts.category]
 * @param {string} [opts.status]
 * @param {string[]} [opts.tags]
 */
export function buildPostPayload(opts) {
  const { suffix, title, content, category, status, tags } = opts;
  return {
    postTitle: title ?? buildPostTitle(suffix),
    postContent: content ?? buildPostContent(suffix),
    postCategory: category ?? DEFAULT_CATEGORY,
    postStatus: status ?? "DRAFT",
    tags: tags ?? ["DNA_TESTING", "TIPS"],
  };
}

export function uniqueSuffix() {
  return `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}
