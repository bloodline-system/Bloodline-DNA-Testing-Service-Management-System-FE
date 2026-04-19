/**
 * Text & locator hints bám PostManagementPage.tsx — ưu tiên semantic / data-slot.
 * Dễ fail: thay đổi copy hoặc cấu trúc Card/hero.
 */

export const POST_TEXT = {
  heroHeading: "Build and manage posts with a cleaner editor.",
  filtersHeading: "Filters",
  totalPostsLabel: "Total posts",
  currentPageLabel: "Current page",
  modeLabel: "Mode",
  modeCreate: "Create",
  modeUpdate: "Update",
  createPostHeading: "Create post",
  editPostHeading: "Edit post",
  emptyList: "No posts found for the current filters.",
  loadError: "Unable to load posts.",
  loading: "Loading posts...",
  searchLabel: "Search title",
  reset: "Reset",
  previous: "Previous",
  next: "Next",
  createPost: "Create post",
  updatePost: "Update post",
  edit: "Edit",
  publish: "Publish",
  archive: "Archive",
  delete: "Delete",
  uploadingImage: "Uploading image...",
};

/** Playwright locator expression strings (dùng trong page.locator) */
export const PW = {
  postCard: '[data-slot="card"]',
  cardTitle: '[data-slot="card-title"]',
};
