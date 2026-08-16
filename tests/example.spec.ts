import { test, expect, type Page } from "@playwright/test";

const TEST_EMAIL = process.env.TEST_EMAIL ?? "playwright@example.com";
const TEST_PASSWORD = process.env.TEST_PASSWORD ?? "playwright-password";

async function login(page: Page) {
  await page.goto("/login");
  await page.getByPlaceholder("Email").fill(TEST_EMAIL);
  await page.getByPlaceholder("Heslo").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Prihlásiť sa" }).click();
  await expect(page.getByRole("heading", { name: "Ešte kúpiť" })).toBeVisible();
}

test("redirects unauthenticated users to the login page", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login/);
  await expect(
    page.getByRole("heading", { name: "Nákupný lístok" }),
  ).toBeVisible();
});

test("logs in with valid credentials and shows the dashboard", async ({
  page,
}) => {
  await login(page);
  await expect(page).toHaveURL("/");
  await expect(page.getByText("Nákupný lístok")).toBeVisible();
});

test("shows an error for invalid credentials", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("Email").fill("wrong@example.com");
  await page.getByPlaceholder("Heslo").fill("wrong-password");
  await page.getByRole("button", { name: "Prihlásiť sa" }).click();

  await expect(page.locator(".error")).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test("adds, toggles, and deletes an item", async ({ page }) => {
  await login(page);

  const text = `test-item-${Date.now()}`;
  await page.getByPlaceholder("Pridať položku...").fill(text);
  await page.getByRole("button", { name: "Pridať" }).click();

  const toBuyGroup = page
    .locator(".list-group")
    .filter({ hasText: "Ešte kúpiť" });
  const item = page.locator(".list-item", { hasText: text });

  await expect(item).toBeVisible();
  await expect(
    toBuyGroup.locator(".list-item", { hasText: text }),
  ).toBeVisible();

  await item.click();
  const boughtGroup = page.locator(".list-group").filter({ hasText: "Kúpené" });
  await expect(
    boughtGroup.locator(".list-item", { hasText: text }),
  ).toBeVisible();

  await page
    .locator(".list-item", { hasText: text })
    .locator(".list-item-delete")
    .click();
  await expect(item).toHaveCount(0);
});

test("logs out and redirects to login", async ({ page }) => {
  await login(page);

  await page.getByRole("button", { name: "Odhlásiť sa" }).click();
  await expect(page).toHaveURL(/\/login/);
  await expect(
    page.getByRole("heading", { name: "Nákupný lístok" }),
  ).toBeVisible();
});
