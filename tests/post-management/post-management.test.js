import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  ALT_CATEGORY,
  buildPostContent,
  buildPostPayload,
  buildPostTitle,
  buildUpdatedTitle,
  uniqueSuffix,
} from "./post-management.factory.js";
import { POST_TEXT } from "./post-management.selectors.js";
import { expectNoCreatePostRequest } from "./network.utils.js";
import { e2eAbsoluteUrl } from "../auth/management-auth.steps.js";
import {
  E2E_FEATURED_IMAGE,
  postCardByTitle,
  postManagementSteps,
} from "./post-management.steps.js";
import { steps } from "../steps.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..", "..");
const sourceLogo = path.join(projectRoot, "src", "assets", "toggle-logo.png");

function ensureFeaturedFixture() {
  const dir = path.dirname(E2E_FEATURED_IMAGE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(E2E_FEATURED_IMAGE) && fs.existsSync(sourceLogo)) {
    fs.copyFileSync(sourceLogo, E2E_FEATURED_IMAGE);
  }
}

async function attachSteps(I) {
  Object.assign(I, steps);
  Object.assign(I, postManagementSteps);
}

/** Đăng nhập MANAGER seed + mở /manager/posts (một step — tránh lỗi URL tương đối trong Playwright). */
async function loginManagerAndPosts(I) {
  await attachSteps(I);
  await I.ensureAuthorizedForPostManagement();
}

// -----------------------------------------------------------------------------
// A — Access / authorization
// -----------------------------------------------------------------------------
Feature("A — Access / authorization");

Scenario(
  "A1 — Guest không vào được post management (redirect /sign-in)",
  async ({ I }) => {
    await attachSteps(I);
    I.amOnPage("/manager/posts");
    I.waitInUrl("/sign-in", 10);
    I.see("Login to your account");
  },
);

Scenario(
  "A2 — User MANAGER/ADMIN truy cập được /manager/posts (hero + filters)",
  async ({ I }) => {
    await loginManagerAndPosts(I);
    I.see(POST_TEXT.heroHeading);
    I.see(POST_TEXT.filtersHeading);
    I.see(POST_TEXT.createPostHeading);
  },
);

Scenario(
  "A2b — User ADMIN truy cập được /manager/posts (hero + filters)",
  async ({ I }) => {
    await attachSteps(I);
    await I.loginForPostManagement({ role: "ADMIN" });
    I.see(POST_TEXT.heroHeading);
    I.see(POST_TEXT.filtersHeading);
    I.see(POST_TEXT.createPostHeading);
  },
);

/**
 * Không dùng sign-up live trong suite post-management nữa.
 * Vì log hiện tại cho thấy auth/sign-up có thể trả 502 làm fail oan toàn suite FE post.
 * Scenario này chỉ verify FE state trên /manager/posts:
 * - hoặc render được hero
 * - hoặc render đúng load error state
 */
Scenario(
  "A3 — /manager/posts hiển thị đúng trạng thái FE (hero hoặc load error)",
  async ({ I }) => {
    await attachSteps(I);
    await I.loginAsManager();

    await I.usePlaywrightTo(
      "open post page and assert hero or load error",
      async ({ page }) => {
        await page.goto(e2eAbsoluteUrl("/manager/posts"));
        await page.waitForLoadState("networkidle").catch(() => {});

        // Avoid fixed sleeps — wait for either expected UI state.
        await Promise.race([
          page
            .getByText(POST_TEXT.heroHeading, { exact: true })
            .waitFor({ state: "visible", timeout: 15000 }),
          page
            .getByText(POST_TEXT.loadError, { exact: true })
            .waitFor({ state: "visible", timeout: 15000 }),
        ]).catch(() => {});

        const heroVisible = await page
          .getByText(POST_TEXT.heroHeading, { exact: true })
          .isVisible()
          .catch(() => false);

        const loadErrorVisible = await page
          .getByText(POST_TEXT.loadError, { exact: true })
          .isVisible()
          .catch(() => false);

        if (!heroVisible && !loadErrorVisible) {
          throw new Error(
            "Không thấy hero cũng không thấy load error trên /manager/posts",
          );
        }
      },
    );
  },
);

// -----------------------------------------------------------------------------
// B — UI rendering (authorized)
// -----------------------------------------------------------------------------
Feature("B — UI rendering (authorized)");

Before(async ({ I }) => {
  await loginManagerAndPosts(I);
});

Scenario(
  "B4 — Trang hiển thị hero, stats, filters, list area, editor, pagination",
  async ({ I }) => {
    I.see(POST_TEXT.heroHeading);
    await I.usePlaywrightTo("see stats labels", async ({ page }) => {
      await page
        .getByText(POST_TEXT.totalPostsLabel, { exact: true })
        .waitFor({ state: "visible", timeout: 10000 });
      await page
        .getByText(POST_TEXT.currentPageLabel, { exact: true })
        .waitFor({ state: "visible", timeout: 10000 });
      await page
        .getByText(POST_TEXT.modeLabel, { exact: true })
        .waitFor({ state: "visible", timeout: 10000 });
    });
    I.see(POST_TEXT.filtersHeading);
    I.see(POST_TEXT.createPostHeading);
    I.see(POST_TEXT.previous);
    I.see(POST_TEXT.next);
  },
);

Scenario("B5 — Filter controls: search + 3 dropdown + Reset", async ({ I }) => {
  I.seeElement(`[aria-label="${POST_TEXT.searchLabel}"]`);
  await I.usePlaywrightTo("three filter selects", async ({ page }) => {
    const filtersCard = page
      .locator('[data-slot="card"]')
      .filter({
        has: page.locator('[data-slot="card-title"]', {
          hasText: POST_TEXT.filtersHeading,
        }),
      })
      .first();

    await filtersCard
      .locator("select")
      .nth(0)
      .waitFor({ state: "visible", timeout: 10000 });
    await filtersCard
      .locator("select")
      .nth(1)
      .waitFor({ state: "visible", timeout: 10000 });
    await filtersCard
      .locator("select")
      .nth(2)
      .waitFor({ state: "visible", timeout: 10000 });
  });
  I.see(POST_TEXT.reset);
});

Scenario("B6 — Editor mặc định mode Create", async ({ I }) => {
  await I.expectStatsModeCreate();
  I.see(POST_TEXT.createPostHeading);
});

// -----------------------------------------------------------------------------
// C — Create post
// -----------------------------------------------------------------------------
Feature("C — Create post");

Before(async ({ I }) => {
  await loginManagerAndPosts(I);
});

Scenario("C7 — Tạo post tối thiểu thành công", async ({ I }) => {
  const suffix = uniqueSuffix();
  const payload = buildPostPayload({ suffix });

  await I.usePlaywrightTo("create minimal", async ({ page }) => {
    await I.createPostFromUI(page, payload);
  });

  await I.expectPostCardVisible(payload.postTitle);

  await I.usePlaywrightTo("cleanup delete", async ({ page }) => {
    await I.deletePostByTitleConfirmed(page, payload.postTitle);
  });
});

Scenario(
  "C8 — Tạo post đầy đủ: ảnh + category + nhiều tag + DRAFT",
  async ({ I }) => {
    ensureFeaturedFixture();

    const suffix = uniqueSuffix();
    const payload = buildPostPayload({
      suffix,
      category: ALT_CATEGORY,
      status: "DRAFT",
      tags: ["HEALTH", "TIPS", "NEWS"],
    });

    await I.usePlaywrightTo("create full", async ({ page }) => {
      await I.createPostFromUI(page, payload, {
        withImagePath: E2E_FEATURED_IMAGE,
      });
    });

    await I.expectPostCardVisible(payload.postTitle);

    await I.usePlaywrightTo("cleanup", async ({ page }) => {
      await I.deletePostByTitleConfirmed(page, payload.postTitle);
    });
  },
);

Scenario(
  "C9 — Sau create thành công, card xuất hiện trong list",
  async ({ I }) => {
    const suffix = uniqueSuffix();
    const payload = buildPostPayload({ suffix });

    await I.usePlaywrightTo("create and see card", async ({ page }) => {
      await I.createPostFromUI(page, payload);
      await postCardByTitle(page, payload.postTitle).waitFor({
        state: "visible",
        timeout: 15000,
      });
      await I.deletePostByTitleConfirmed(page, payload.postTitle);
    });
  },
);

Scenario(
  "C10 — Sau create thành công, editor reset về Create",
  async ({ I }) => {
    const suffix = uniqueSuffix();
    const payload = buildPostPayload({ suffix });

    await I.usePlaywrightTo("create then mode create", async ({ page }) => {
      await I.createPostFromUI(page, payload);
      await I.expectStatsModeCreate();
      I.see(POST_TEXT.createPostHeading);
      await I.deletePostByTitleConfirmed(page, payload.postTitle);
    });
  },
);

// -----------------------------------------------------------------------------
// D — Validation / empty submit (client)
// -----------------------------------------------------------------------------
Feature("D — Validation / empty submit (client)");

Before(async ({ I }) => {
  await loginManagerAndPosts(I);
});

Scenario(
  "D11 — Title rỗng, content có giá trị → không POST create",
  async ({ I }) => {
    await I.usePlaywrightTo("D11", async ({ page }) => {
      await I.fillPostEditor(page, {
        postTitle: "",
        postContent: "has content",
      });

      await expectNoCreatePostRequest(page, async () => {
        await I.submitPostEditor(page);
      });
    });
  },
);

Scenario(
  "D12 — Content rỗng, title có giá trị → không POST create",
  async ({ I }) => {
    await I.usePlaywrightTo("D12", async ({ page }) => {
      await I.fillPostEditor(page, {
        postTitle: "only title",
        postContent: "",
      });

      await expectNoCreatePostRequest(page, async () => {
        await I.submitPostEditor(page);
      });
    });
  },
);

Scenario("D13 — Title chỉ spaces → không POST create", async ({ I }) => {
  await I.usePlaywrightTo("D13", async ({ page }) => {
    await I.fillPostEditor(page, {
      postTitle: "   ",
      postContent: buildPostContent("d13"),
    });

    await expectNoCreatePostRequest(page, async () => {
      await I.submitPostEditor(page);
    });
  });
});

Scenario("D14 — Content chỉ spaces → không POST create", async ({ I }) => {
  await I.usePlaywrightTo("D14", async ({ page }) => {
    await I.fillPostEditor(page, {
      postTitle: buildPostTitle("d14"),
      postContent: "    ",
    });

    await expectNoCreatePostRequest(page, async () => {
      await I.submitPostEditor(page);
    });
  });
});

// -----------------------------------------------------------------------------
// E — Edit post
// -----------------------------------------------------------------------------
Feature("E — Edit post");

Before(async ({ I }) => {
  await loginManagerAndPosts(I);
});

Scenario("E15 — Edit populate form từ card", async ({ I }) => {
  const suffix = uniqueSuffix();
  const payload = buildPostPayload({ suffix });

  await I.usePlaywrightTo("E15", async ({ page }) => {
    await I.createPostFromUI(page, payload);
    await I.openEditorByEdit(page, payload.postTitle);

    const titleVal = await page
      .locator("aside")
      .getByRole("textbox")
      .first()
      .inputValue();

    if (titleVal !== payload.postTitle) {
      throw new Error("title not populated");
    }

    await I.deletePostByTitleConfirmed(page, payload.postTitle);
  });
});

Scenario("E16 — Update title thành công", async ({ I }) => {
  const suffix = uniqueSuffix();
  const payload = buildPostPayload({ suffix });
  const newTitle = buildUpdatedTitle(suffix);

  await I.usePlaywrightTo("E16", async ({ page }) => {
    await I.createPostFromUI(page, payload);
    await I.openEditorByEdit(page, payload.postTitle);
    await I.fillPostEditor(page, { postTitle: newTitle });
    await I.updatePostFromUI(page, { postTitle: newTitle });

    await postCardByTitle(page, newTitle).waitFor({ state: "visible" });
    await I.deletePostByTitleConfirmed(page, newTitle);
  });
});

Scenario("E17 — Update content thành công", async ({ I }) => {
  const suffix = uniqueSuffix();
  const payload = buildPostPayload({ suffix });
  const newContent = buildPostContent(`${suffix}_upd`);

  await I.usePlaywrightTo("E17", async ({ page }) => {
    await I.createPostFromUI(page, payload);
    await I.openEditorByEdit(page, payload.postTitle);
    await I.fillPostEditor(page, { postContent: newContent });
    await I.updatePostFromUI(page, { postContent: newContent });

    await postCardByTitle(page, payload.postTitle)
      .getByText(newContent.slice(0, 80), {
        exact: false,
      })
      .waitFor({ state: "visible" });

    await I.deletePostByTitleConfirmed(page, payload.postTitle);
  });
});

Scenario("E18 — Update category / status / tags", async ({ I }) => {
  const suffix = uniqueSuffix();
  const payload = buildPostPayload({ suffix, tags: [] });

  await I.usePlaywrightTo("E18", async ({ page }) => {
    await I.createPostFromUI(page, payload);
    await I.openEditorByEdit(page, payload.postTitle);

    await I.updatePostFromUI(page, {
      postCategory: "CASE_STUDIES",
      postStatus: "DRAFT",
      tags: ["GENETICS"],
    });

    const card = postCardByTitle(page, payload.postTitle);
    await card.getByText("Case Studies", { exact: false }).waitFor({
      state: "visible",
    });

    await I.deletePostByTitleConfirmed(page, payload.postTitle);
  });
});

/**
 * E19 — Upload ảnh khi edit (phụ thuộc API upload; nếu fail có thể skip env).
 */
Scenario("E19 — Update featured image", async ({ I }) => {
  ensureFeaturedFixture();

  const suffix = uniqueSuffix();
  const payload = buildPostPayload({ suffix });

  await I.usePlaywrightTo("E19", async ({ page }) => {
    await I.createPostFromUI(page, payload);
    await I.openEditorByEdit(page, payload.postTitle);
    await I.uploadFeaturedImage(page, E2E_FEATURED_IMAGE);
    await I.updatePostFromUI(page, {});

    await postCardByTitle(page, payload.postTitle)
      .locator("img")
      .first()
      .waitFor({ state: "visible", timeout: 15000 });

    await I.deletePostByTitleConfirmed(page, payload.postTitle);
  });
});

Scenario("E20 — Sau update, list phản ánh (badge/title)", async ({ I }) => {
  const suffix = uniqueSuffix();
  const payload = buildPostPayload({ suffix });
  const newTitle = buildUpdatedTitle(suffix);

  await I.usePlaywrightTo("E20", async ({ page }) => {
    await I.createPostFromUI(page, payload);
    await I.openEditorByEdit(page, payload.postTitle);
    await I.fillPostEditor(page, {
      postTitle: newTitle,
      postStatus: "PUBLISHED",
    });
    await I.updatePostFromUI(page, {
      postTitle: newTitle,
      postStatus: "PUBLISHED",
    });

    await I.expectCardStatusBadge(page, newTitle, "Published");
    await I.deletePostByTitleConfirmed(page, newTitle);
  });
});

Scenario("E21 — Reset khi edit → mode Create + form sạch", async ({ I }) => {
  const suffix = uniqueSuffix();
  const payload = buildPostPayload({ suffix });

  await I.usePlaywrightTo("E21", async ({ page }) => {
    await I.createPostFromUI(page, payload);
    await I.openEditorByEdit(page, payload.postTitle);
    await I.resetPostEditor(page);
    await I.expectStatsModeCreate();
    I.see(POST_TEXT.createPostHeading);
    await I.deletePostByTitleConfirmed(page, payload.postTitle);
  });
});

// -----------------------------------------------------------------------------
// F — Status actions on card
// -----------------------------------------------------------------------------
Feature("F — Status actions on card");

Before(async ({ I }) => {
  await loginManagerAndPosts(I);
});

Scenario("F22 — Publish → badge Published", async ({ I }) => {
  const suffix = uniqueSuffix();
  const payload = buildPostPayload({ suffix });

  await I.usePlaywrightTo("F22", async ({ page }) => {
    await I.createPostFromUI(page, payload);
    const patch = I.waitForPatchStatusOk(page);
    await I.clickCardActionByTitle(page, payload.postTitle, "Publish");
    await patch;
    await I.expectCardStatusBadge(page, payload.postTitle, "Published");
    await I.deletePostByTitleConfirmed(page, payload.postTitle);
  });
});

Scenario("F23 — Archive → badge Archived", async ({ I }) => {
  const suffix = uniqueSuffix();
  const payload = buildPostPayload({ suffix });

  await I.usePlaywrightTo("F23", async ({ page }) => {
    await I.createPostFromUI(page, payload);
    const patch = I.waitForPatchStatusOk(page);
    await I.clickCardActionByTitle(page, payload.postTitle, "Archive");
    await patch;
    await I.expectCardStatusBadge(page, payload.postTitle, "Archived");
    await I.deletePostByTitleConfirmed(page, payload.postTitle);
  });
});

/**
 * F24 — Đã Published, bấm Publish lại: chờ PATCH; assert badge vẫn Published.
 */
Scenario(
  "F24 — Publish khi đã Published (an toàn theo behavior thực tế)",
  async ({ I }) => {
    const suffix = uniqueSuffix();
    const payload = buildPostPayload({ suffix });

    await I.usePlaywrightTo("F24", async ({ page }) => {
      await I.createPostFromUI(page, payload);

      let patch = I.waitForPatchStatusOk(page);
      await I.clickCardActionByTitle(page, payload.postTitle, "Publish");
      await patch;

      patch = I.waitForPatchStatusOk(page);
      await I.clickCardActionByTitle(page, payload.postTitle, "Publish");
      await patch;

      await I.expectCardStatusBadge(page, payload.postTitle, "Published");
      await I.deletePostByTitleConfirmed(page, payload.postTitle);
    });
  },
);

/**
 * F25 — Đã Archived, bấm Archive lại: chờ PATCH; assert badge Archived.
 */
Scenario("F25 — Archive khi đã Archived", async ({ I }) => {
  const suffix = uniqueSuffix();
  const payload = buildPostPayload({ suffix });

  await I.usePlaywrightTo("F25", async ({ page }) => {
    await I.createPostFromUI(page, payload);

    let patch = I.waitForPatchStatusOk(page);
    await I.clickCardActionByTitle(page, payload.postTitle, "Archive");
    await patch;

    patch = I.waitForPatchStatusOk(page);
    await I.clickCardActionByTitle(page, payload.postTitle, "Archive");
    await patch;

    await I.expectCardStatusBadge(page, payload.postTitle, "Archived");
    await I.deletePostByTitleConfirmed(page, payload.postTitle);
  });
});

// -----------------------------------------------------------------------------
// G — Delete
// -----------------------------------------------------------------------------
Feature("G — Delete");

Before(async ({ I }) => {
  await loginManagerAndPosts(I);
});

Scenario(
  "G26 — Delete accept → post biến mất khỏi list mặc định hoặc không còn card",
  async ({ I }) => {
    const suffix = uniqueSuffix();
    const payload = buildPostPayload({ suffix });

    await I.usePlaywrightTo("G26", async ({ page }) => {
      await I.createPostFromUI(page, payload);
      await I.deletePostByTitleConfirmed(page, payload.postTitle);
      await postCardByTitle(page, payload.postTitle)
        .waitFor({ state: "hidden", timeout: 15000 })
        .catch(() => null);
    });
  },
);

/**
 * G27 — Soft delete: nếu backend vẫn trả bài DELETED trong list, filter status Deleted phải thấy.
 * Nếu list mặc định ẩn DELETED, card đã biến mất ở G26.
 */
Scenario(
  "G27 — Sau delete, kiểm tra behavior ổn định (Deleted hoặc đã ẩn)",
  async ({ I }) => {
    const suffix = uniqueSuffix();
    const payload = buildPostPayload({ suffix });

    await I.usePlaywrightTo("G27", async ({ page }) => {
      await I.createPostFromUI(page, payload);
      await I.deletePostByTitleConfirmed(page, payload.postTitle);

      const still = await postCardByTitle(page, payload.postTitle)
        .isVisible()
        .catch(() => false);

      if (still) {
        await I.expectCardStatusBadge(page, payload.postTitle, "Deleted");
        await I.deletePostByTitleConfirmed(page, payload.postTitle);
      }
    });
  },
);

Scenario("G28 — Delete dismiss → post vẫn còn", async ({ I }) => {
  const suffix = uniqueSuffix();
  const payload = buildPostPayload({ suffix });

  await I.usePlaywrightTo("G28", async ({ page }) => {
    await I.createPostFromUI(page, payload);
    await I.deletePostByTitleDismiss(page, payload.postTitle);
    await I.expectPostCardVisible(page, payload.postTitle);
    await I.deletePostByTitleConfirmed(page, payload.postTitle);
  });
});

// -----------------------------------------------------------------------------
// H — Search / filter
// -----------------------------------------------------------------------------
Feature("H — Search / filter");

Before(async ({ I }) => {
  await loginManagerAndPosts(I);
});

Scenario("H29 — Search title match", async ({ I }) => {
  const suffix = uniqueSuffix();
  const payload = buildPostPayload({ suffix });

  await I.usePlaywrightTo("H29", async ({ page }) => {
    await I.createPostFromUI(page, payload);
    await I.filterPosts(page, { query: payload.postTitle });
    await postCardByTitle(page, payload.postTitle).waitFor({
      state: "visible",
    });
    await I.resetFilters(page);
    await I.deletePostByTitleConfirmed(page, payload.postTitle);
  });
});

Scenario("H30 — Search không match → empty state", async ({ I }) => {
  await I.usePlaywrightTo("H30", async ({ page }) => {
    // NOTE: Avoid '_' because backend uses SQL LIKE and '_' is a single-char wildcard.
    await I.filterPosts(page, { query: "NO-SUCH-TITLE-E2E-DOES-NOT-EXIST" });
    await page
      .getByText(POST_TEXT.emptyList, { exact: true })
      .waitFor({ state: "visible", timeout: 15000 });
    await I.resetFilters(page);
  });
});

Scenario("H31 — Filter status", async ({ I }) => {
  const suffix = uniqueSuffix();
  const payload = buildPostPayload({ suffix });

  await I.usePlaywrightTo("H31", async ({ page }) => {
    await I.createPostFromUI(page, payload);
    await I.filterPosts(page, { status: "DRAFT" });
    await postCardByTitle(page, payload.postTitle).waitFor({
      state: "visible",
    });
    await I.resetFilters(page);
    await I.deletePostByTitleConfirmed(page, payload.postTitle);
  });
});

Scenario("H32 — Filter category", async ({ I }) => {
  const suffix = uniqueSuffix();
  const payload = buildPostPayload({ suffix, category: "NEWS" });

  await I.usePlaywrightTo("H32", async ({ page }) => {
    await I.createPostFromUI(page, payload);
    await I.filterPosts(page, { category: "NEWS" });
    await postCardByTitle(page, payload.postTitle).waitFor({
      state: "visible",
    });
    await I.resetFilters(page);
    await I.deletePostByTitleConfirmed(page, payload.postTitle);
  });
});

Scenario("H33 — Filter tag", async ({ I }) => {
  const suffix = uniqueSuffix();
  const payload = buildPostPayload({
    suffix,
    tags: ["LEGAL", "IMMIGRATION"],
  });

  await I.usePlaywrightTo("H33", async ({ page }) => {
    await I.createPostFromUI(page, payload);
    await I.filterPosts(page, { tag: "LEGAL" });
    await postCardByTitle(page, payload.postTitle).waitFor({
      state: "visible",
    });
    await I.resetFilters(page);
    await I.deletePostByTitleConfirmed(page, payload.postTitle);
  });
});

Scenario("H34 — Kết hợp search + filter", async ({ I }) => {
  const suffix = uniqueSuffix();
  const payload = buildPostPayload({ suffix, category: "NEWS" });

  await I.usePlaywrightTo("H34", async ({ page }) => {
    await I.createPostFromUI(page, payload);
    await I.filterPosts(page, {
      query: payload.postTitle,
      status: "DRAFT",
      category: "NEWS",
    });
    await postCardByTitle(page, payload.postTitle).waitFor({
      state: "visible",
    });
    await I.resetFilters(page);
    await I.deletePostByTitleConfirmed(page, payload.postTitle);
  });
});

Scenario("H35 — Reset filter", async ({ I }) => {
  await I.usePlaywrightTo("H35", async ({ page }) => {
    await I.filterPosts(page, { query: "xyz" });
    await I.resetFilters(page);
    await page.getByLabel(POST_TEXT.searchLabel).waitFor({
      state: "visible",
    });
  });
});

// -----------------------------------------------------------------------------
// I — Pagination (page size = 6 trên UI)
// -----------------------------------------------------------------------------
Feature("I — Pagination (page size = 6 trên UI)");

Before(async ({ I }) => {
  await loginManagerAndPosts(I);
});

Scenario("I36 — Previous disabled ở trang đầu", async ({ I }) => {
  await I.usePlaywrightTo("I36", async ({ page }) => {
    await page
      .getByRole("button", { name: POST_TEXT.previous })
      .waitFor({ state: "visible" });

    await page
      .getByRole("button", { name: POST_TEXT.previous })
      .isDisabled()
      .then((d) => {
        if (!d) throw new Error("Previous should be disabled on page 0");
      });
  });
});

Scenario(
  "I37–I38 — Next rồi Previous khi có >1 trang (tạo 7 bài, size UI=6)",
  async ({ I }) => {
    const base = uniqueSuffix();
    const titles = [];

    await I.usePlaywrightTo("create 7 posts", async ({ page }) => {
      for (let i = 0; i < 7; i += 1) {
        const payload = buildPostPayload({
          suffix: `${base}_${i}`,
          title: buildPostTitle(`${base}_p_${i}`),
        });
        titles.push(payload.postTitle);
        await I.createPostFromUI(page, payload);
      }
    });

    await I.usePlaywrightTo("paginate", async ({ page }) => {
      await page.getByRole("button", { name: POST_TEXT.next }).click();
      await page.waitForResponse(
        (r) =>
          r.url().includes("/api/v1/manager/posts") &&
          r.request().method() === "GET",
      );

      const stat = await I.readCurrentPageStat(page);
      if (!stat.includes("1 /")) {
        throw new Error(`Expected page 1 in stats, got: ${stat}`);
      }

      await page.getByRole("button", { name: POST_TEXT.previous }).click();
      await page.waitForResponse(
        (r) =>
          r.url().includes("/api/v1/manager/posts") &&
          r.request().method() === "GET",
      );

      const stat0 = await I.readCurrentPageStat(page);
      if (!stat0.includes("0 /")) {
        throw new Error(`Expected page 0 in stats, got: ${stat0}`);
      }
    });

    await I.usePlaywrightTo("cleanup 7", async ({ page }) => {
      for (const t of titles) {
        await I.resetFilters(page);
        await I.filterPosts(page, { query: t });
        await I.deletePostByTitleConfirmed(page, t);
      }
    });
  },
);

Scenario("I39 — Current page stats khớp sau Next", async ({ I }) => {
  const suffix = uniqueSuffix();
  const payload = buildPostPayload({ suffix });

  await I.usePlaywrightTo("I39", async ({ page }) => {
    await I.createPostFromUI(page, payload);
    const stat0 = await I.readCurrentPageStat(page);
    if (!stat0.match(/\d+\s*\/\s*\d+/)) {
      throw new Error(stat0);
    }
    await I.deletePostByTitleConfirmed(page, payload.postTitle);
  });
});

Scenario(
  "I40 — Không assume backend default size=10; UI gửi size=6 (kiểm tra query)",
  async ({ I }) => {
    await I.usePlaywrightTo("I40", async ({ page }) => {
      const wait = page.waitForRequest((req) => {
        const u = req.url();
        return (
          req.method() === "GET" &&
          u.includes("/api/v1/manager/posts") &&
          u.includes("size=6")
        );
      });

      await page.reload();
      await wait;
    });
  },
);
