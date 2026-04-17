export interface ApiResponse<TData> {
  code: number;
  message: string;
  data: TData;
  path: string;
  timestamp: string;
}

export interface PageResponse<TData> {
  content: TData[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const POST_CATEGORIES = [
  "DNA_KNOWLEDGE",
  "TESTING_GUIDE",
  "NEWS",
  "CASE_STUDIES",
  "ANNOUNCEMENTS",
] as const;

export type PostCategory = (typeof POST_CATEGORIES)[number];

export const POST_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED", "DELETED"] as const;

export type PostStatus = (typeof POST_STATUSES)[number];

export const POST_TAGS = [
  "DNA_TESTING",
  "HEALTH",
  "FAMILY",
  "LEGAL",
  "IMMIGRATION",
  "CASE_STUDY",
  "PROMOTION",
  "NEWS",
  "GENETICS",
  "DISEASE_SCREENING",
  "TIPS",
  "CUSTOMER_STORY",
] as const;

export type PostTag = (typeof POST_TAGS)[number];

export interface ContentPostResponse {
  postId: number;
  createdAt: string | null;
  featuredImageUrl: string | null;
  likeCount: number | null;
  postCategory: PostCategory;
  postContent: string;
  postStatus: PostStatus;
  postTitle: string;
  publishedAt: string | null;
  shareCount: number | null;
  updatedAt: string | null;
  viewCount: number | null;
  authorId: string | null;
  tags: PostTag[];
}

export interface ContentPostRequest {
  authorId?: string;
  postId?: number;
  postTitle: string;
  postContent: string;
  featuredImageUrl?: string | null;
  postCategory: PostCategory;
  tags?: PostTag[];
  postStatus?: PostStatus | null;
}

export interface PostFilters {
  query: string;
  status: PostStatus | "all";
  category: PostCategory | "all";
  tag: PostTag | "all";
  page: number;
  size: number;
}
