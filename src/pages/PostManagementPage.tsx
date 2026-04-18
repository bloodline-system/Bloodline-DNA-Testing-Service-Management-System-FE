import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Edit3,
  Image as ImageIcon,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";

import LogoImage from "@/assets/toggle-logo.png";
import { Navbar } from "@/components/layout/home/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  POST_CATEGORIES,
  POST_STATUSES,
  POST_TAGS,
  type ContentPostRequest,
  type ContentPostResponse,
  type PostCategory,
  type PostFilters,
  type PostStatus,
} from "@/services/post/types";
import {
  useCreatePostMutation,
  useDeletePostMutation,
  usePostsQuery,
  useUpdatePostMutation,
  useUpdatePostStatusMutation,
} from "@/services/post/post.queries";
import { useUploadImageMutation } from "@/services/user/user.queries";
import { useFetchMe } from "@/services/user/user.queries";
import { useAuthStore } from "@/stores/auth/useAuthStore";

const POST_MENU = [{ title: "Home", url: "/" }];

const POST_AUTH = {
  login: { title: "Sign In", url: "/sign-in" },
  signup: { title: "Sign Up", url: "/sign-up" },
};

const initialFilters: PostFilters = {
  query: "",
  status: "all",
  category: "all",
  tag: "all",
  page: 0,
  size: 6,
};

const DEFAULT_EDITOR: ContentPostRequest = {
  postTitle: "",
  postContent: "",
  featuredImageUrl: "",
  postCategory: POST_CATEGORIES[0],
  tags: [],
  postStatus: "DRAFT",
};

const statusLabel = (status: PostStatus) =>
  status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/(^|\s)\S/g, (character) => character.toUpperCase());

const formatDate = (value: string | null) => {
  if (!value) return "Not set";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const PostManagementPage = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const meQuery = useFetchMe(Boolean(accessToken));
  const profile = meQuery.data?.data ?? null;

  const [filters, setFilters] = useState<PostFilters>(initialFilters);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [editor, setEditor] = useState<ContentPostRequest>(DEFAULT_EDITOR);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  const postsQuery = usePostsQuery(filters);
  const createPostMutation = useCreatePostMutation();
  const updatePostMutation = useUpdatePostMutation();
  const updateStatusMutation = useUpdatePostStatusMutation();
  const deletePostMutation = useDeletePostMutation();
  const uploadImageMutation = useUploadImageMutation();

  const postsResponse = postsQuery.data?.data;
  const posts = postsResponse?.content ?? [];
  const stats = {
    total: postsResponse?.totalElements ?? 0,
    totalPages: postsResponse?.totalPages ?? 0,
    page: postsResponse?.pageNumber ?? 0,
  };

  useEffect(() => {
    return () => {
      if (imagePreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const resetEditor = () => {
    setSelectedPostId(null);
    setEditor(DEFAULT_EDITOR);
    setSelectedImageFile(null);
    setImagePreviewUrl("");
  };

  const uploadSelectedImage = async (file: File, previewUrl?: string) => {
    const uploadResponse = await uploadImageMutation.mutateAsync(file);
    const fileName = uploadResponse.data;
    const imageUrl = `/api/upload/files/${encodeURIComponent(fileName)}`;

    setEditor((current) => ({
      ...current,
      featuredImageUrl: imageUrl,
    }));
    setImagePreviewUrl(imageUrl);

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedImageFile(null);
      setImagePreviewUrl(
        selectedPostId != null ? (editor.featuredImageUrl ?? "") : "",
      );
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setSelectedImageFile(file);
    setImagePreviewUrl(previewUrl);
    event.target.value = "";

    await uploadSelectedImage(file, previewUrl);
  };

  const handleEditorSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const payload: ContentPostRequest = {
      ...editor,
      postTitle: editor.postTitle.trim(),
      postContent: editor.postContent.trim(),
      featuredImageUrl: editor.featuredImageUrl?.trim() || null,
      tags: editor.tags ?? [],
      postStatus: editor.postStatus ?? "DRAFT",
    };

    if (!payload.postTitle || !payload.postContent) {
      return;
    }

    if (selectedPostId != null) {
      await updatePostMutation.mutateAsync({
        postId: selectedPostId,
        data: payload,
      });
    } else {
      await createPostMutation.mutateAsync(payload);
    }

    resetEditor();
  };

  const openEditor = (post: ContentPostResponse) => {
    setSelectedPostId(post.postId);
    setEditor({
      postTitle: post.postTitle,
      postContent: post.postContent,
      featuredImageUrl: post.featuredImageUrl ?? "",
      postCategory: post.postCategory,
      tags: post.tags ?? [],
      postStatus: post.postStatus,
    });
    setSelectedImageFile(null);
    setImagePreviewUrl(post.featuredImageUrl ?? "");
  };

  const handlePublish = async (
    post: ContentPostResponse,
    nextStatus: PostStatus,
  ) => {
    await updateStatusMutation.mutateAsync({
      postId: post.postId,
      status: nextStatus,
    });
  };

  const handleDelete = async (post: ContentPostResponse) => {
    const confirmed = window.confirm(`Delete post "${post.postTitle}"?`);
    if (!confirmed) return;

    await deletePostMutation.mutateAsync({ postId: post.postId });
  };

  const toggleTag = (tag: (typeof POST_TAGS)[number]) => {
    setEditor((current) => {
      const tags = current.tags ?? [];
      return {
        ...current,
        tags: tags.includes(tag)
          ? tags.filter((currentTag) => currentTag !== tag)
          : [...tags, tag],
      };
    });
  };

  return (
    <main className="min-h-svh bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.12),_transparent_24%),linear-gradient(180deg,_#f8fbff_0%,_#ffffff_42%,_#eef6ff_100%)] text-slate-900">
      <header className="sticky top-0 z-50 flex justify-center border-b border-white/70 bg-white/85 text-slate-900 backdrop-blur-xl">
        <Navbar
          className="flex w-11/12 justify-center py-3"
          inverted={false}
          logo={{
            url: "/",
            src: LogoImage,
            alt: "Bloodline logo",
            title: "Bloodline DNA",
          }}
          menu={POST_MENU}
          auth={POST_AUTH}
          profile={profile}
        />
      </header>

      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10 lg:px-10">
        <Card className="overflow-hidden border-slate-200/80 bg-white/92 shadow-2xl shadow-slate-200/70 backdrop-blur">
          <div className="grid gap-6 px-6 py-6 md:grid-cols-[1.1fr_0.9fr] md:px-8 md:py-8">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                <Sparkles className="size-3.5" />
                Content studio
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                  Build and manage posts with a cleaner editor.
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                  Search titles, organize categories, upload featured images,
                  and publish content from one place.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Total posts
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-slate-950">
                    {stats.total}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Current page
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-slate-950">
                    {stats.page} / {Math.max(stats.totalPages, 1)}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Mode
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-slate-950">
                    {selectedPostId ? "Update" : "Create"}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,_rgba(255,255,255,0.95),_rgba(241,245,249,0.95))] p-5 shadow-lg shadow-slate-200/60">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-200/70">
                  <ImageIcon className="size-5" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500">
                    Editor snapshot
                  </div>
                  <div className="text-lg font-semibold text-slate-950">
                    {selectedPostId
                      ? "Editing existing post"
                      : "Drafting new post"}
                  </div>
                </div>
              </div>
              <div className="mt-5 grid gap-3 text-sm text-slate-600">
                <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3">
                  File upload is handled before saving so the post payload stays
                  lean.
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3">
                  Search is title-based to keep result filtering predictable.
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-slate-200/80 bg-white/90 shadow-lg shadow-slate-200/60 backdrop-blur">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-sky-50 via-white to-indigo-50">
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              Search and narrow down the current post catalogue.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 p-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_auto]">
            <Input
              placeholder="Search title"
              aria-label="Search title"
              value={filters.query}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  query: event.target.value,
                  page: 0,
                }))
              }
            />
            <select
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm shadow-sm"
              value={filters.status}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  status: event.target.value as PostFilters["status"],
                  page: 0,
                }))
              }
            >
              <option value="all">All status</option>
              {POST_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {statusLabel(status)}
                </option>
              ))}
            </select>
            <select
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm shadow-sm"
              value={filters.category}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  category: event.target.value as PostFilters["category"],
                  page: 0,
                }))
              }
            >
              <option value="all">All categories</option>
              {POST_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category.replaceAll("_", " ")}
                </option>
              ))}
            </select>
            <select
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm shadow-sm"
              value={filters.tag}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  tag: event.target.value as PostFilters["tag"],
                  page: 0,
                }))
              }
            >
              <option value="all">All tags</option>
              {POST_TAGS.map((tag) => (
                <option key={tag} value={tag}>
                  {tag.replaceAll("_", " ")}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl"
              onClick={() => setFilters(initialFilters)}
            >
              Reset
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-4">
            {postsQuery.isLoading ? (
              <Card className="border-slate-200/80 bg-white/90 shadow-lg shadow-slate-200/60 backdrop-blur">
                <CardContent className="py-10 text-center text-slate-600">
                  Loading posts...
                </CardContent>
              </Card>
            ) : postsQuery.isError ? (
              <Card className="border-slate-200/80 bg-white/90 shadow-lg shadow-slate-200/60 backdrop-blur">
                <CardContent className="py-10 text-center text-slate-600">
                  Unable to load posts.
                </CardContent>
              </Card>
            ) : posts.length === 0 ? (
              <Card className="border-slate-200/80 bg-white/90 shadow-lg shadow-slate-200/60 backdrop-blur">
                <CardContent className="py-10 text-center text-slate-600">
                  No posts found for the current filters.
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => {
                const isSelected = selectedPostId === post.postId;
                const featuredThumb = post.featuredImageUrl || null;

                return (
                  <Card
                    key={post.postId}
                    className={`overflow-hidden border transition-all ${isSelected ? "border-sky-400 shadow-xl shadow-sky-100" : "border-slate-200/80 shadow-md shadow-slate-100 hover:-translate-y-0.5 hover:shadow-lg"}`}
                  >
                    <CardHeader className="space-y-4 border-b border-slate-100 bg-gradient-to-r from-white via-slate-50 to-sky-50/60">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <CardTitle className="text-xl leading-tight text-slate-950">
                            {post.postTitle}
                          </CardTitle>
                          <CardDescription>
                            {post.postCategory.replaceAll("_", " ")} ·{" "}
                            {formatDate(post.createdAt)}
                          </CardDescription>
                        </div>
                        <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-sm">
                          {statusLabel(post.postStatus)}
                        </div>
                      </div>

                      <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)]">
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                          {featuredThumb ? (
                            <img
                              src={featuredThumb}
                              alt={post.postTitle}
                              className="h-36 w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-36 items-center justify-center text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                              No image
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                            {post.postContent}
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                            <span>Views: {post.viewCount ?? 0}</span>
                            <span>Likes: {post.likeCount ?? 0}</span>
                            <span>Shares: {post.shareCount ?? 0}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 p-6">
                      <div className="flex flex-wrap gap-2">
                        {(post.tags ?? []).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
                          >
                            {tag.replaceAll("_", " ")}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => openEditor(post)}
                        >
                          <Edit3 className="mr-2 size-4" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => void handlePublish(post, "PUBLISHED")}
                          disabled={updateStatusMutation.isPending}
                        >
                          <CheckCircle2 className="mr-2 size-4" />
                          Publish
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => void handlePublish(post, "ARCHIVED")}
                          disabled={updateStatusMutation.isPending}
                        >
                          Archive
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => void handleDelete(post)}
                          disabled={deletePostMutation.isPending}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}

            <div className="flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    page: Math.max(0, current.page - 1),
                  }))
                }
                disabled={filters.page === 0}
              >
                <ArrowLeft className="mr-2 size-4" />
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    page: Math.min(
                      Math.max(stats.totalPages - 1, 0),
                      current.page + 1,
                    ),
                  }))
                }
                disabled={filters.page >= Math.max(stats.totalPages - 1, 0)}
              >
                Next
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </section>

          <aside className="space-y-4">
            <Card className="sticky top-24 border-slate-200/80 bg-white/95 shadow-xl shadow-slate-200/70 backdrop-blur">
              <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 via-white to-sky-50">
                <CardTitle>
                  {selectedPostId ? "Edit post" : "Create post"}
                </CardTitle>
                <CardDescription>
                  Use the editor to draft content or adjust an existing post.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form className="space-y-4" onSubmit={handleEditorSubmit}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={editor.postTitle}
                      onChange={(event) =>
                        setEditor((current) => ({
                          ...current,
                          postTitle: event.target.value,
                        }))
                      }
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <select
                      className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                      value={editor.postCategory}
                      onChange={(event) =>
                        setEditor((current) => ({
                          ...current,
                          postCategory: event.target.value as PostCategory,
                        }))
                      }
                    >
                      {POST_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category.replaceAll("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <select
                      className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                      value={editor.postStatus ?? "DRAFT"}
                      onChange={(event) =>
                        setEditor((current) => ({
                          ...current,
                          postStatus: event.target.value as PostStatus,
                        }))
                      }
                    >
                      {POST_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {statusLabel(status)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Featured image
                    </label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="bg-white"
                    />
                    {selectedImageFile ? (
                      <p className="text-xs text-slate-500">
                        Selected: {selectedImageFile.name}
                      </p>
                    ) : null}
                    {uploadImageMutation.isPending ? (
                      <p className="text-xs text-slate-500">
                        Uploading image...
                      </p>
                    ) : null}
                    {imagePreviewUrl ? (
                      <img
                        src={imagePreviewUrl}
                        alt="Featured preview"
                        className="h-44 w-full rounded-2xl border border-slate-200 object-cover shadow-sm"
                      />
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Content</label>
                    <Textarea
                      className="min-h-40 bg-white"
                      value={editor.postContent}
                      onChange={(event) =>
                        setEditor((current) => ({
                          ...current,
                          postContent: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {POST_TAGS.map((tag) => {
                        const active = (editor.tags ?? []).includes(tag);

                        return (
                          <button
                            key={tag}
                            type="button"
                            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${active ? "border-sky-500 bg-sky-500 text-white shadow-sm shadow-sky-100" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
                            onClick={() => toggleTag(tag)}
                          >
                            {tag.replaceAll("_", " ")}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="submit"
                      className="flex-1 rounded-xl"
                      disabled={
                        createPostMutation.isPending ||
                        updatePostMutation.isPending ||
                        uploadImageMutation.isPending
                      }
                    >
                      <Plus className="mr-2 size-4" />
                      {selectedPostId ? "Update post" : "Create post"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl"
                      onClick={resetEditor}
                    >
                      Reset
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default PostManagementPage;
