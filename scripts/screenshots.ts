import { mkdir } from "node:fs/promises";
import path from "node:path";

import { chromium, type BrowserContext, type Page } from "playwright";

const base = process.env.BASE_URL ?? "http://127.0.0.1:43123";
const outDir = path.join(process.cwd(), "docs", "screenshots");

async function settle(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page.evaluate(() => document.fonts.ready);
}

async function assertNoHorizontalScroll(page: Page, label: string) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  if (overflow > 1) {
    throw new Error(`${label} overflows horizontally by ${overflow}px`);
  }
}

async function shot(page: Page, name: string) {
  await page.screenshot({ path: path.join(outDir, name), fullPage: true });
}

async function open(context: BrowserContext, url: string) {
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  await settle(page);
  return page;
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch();
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });
  const forceLight = () => localStorage.setItem("theme", "light");
  await desktop.addInitScript(forceLight);
  await mobile.addInitScript(forceLight);
  await mobile.grantPermissions(["clipboard-read", "clipboard-write"]);

  const landingDesktop = await open(desktop, base);
  await shot(landingDesktop, "landing-desktop.png");

  const resultsDesktop = await open(desktop, `${base}/coach?persona=sam`);
  await resultsDesktop.getByTestId("results").waitFor();
  await resultsDesktop.getByText("11/12").waitFor();
  await resultsDesktop.getByRole("heading", { name: "Deliberate" }).waitFor();
  await shot(resultsDesktop, "results-desktop.png");

  const landingMobile = await open(mobile, base);
  await assertNoHorizontalScroll(landingMobile, "landing 390");
  await shot(landingMobile, "landing-mobile.png");
  await landingDesktop.getByTestId("math-found").screenshot({ path: path.join(outDir, "math-found-desktop.png") });

  const narrow = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const narrowPage = await open(narrow, base);
  await assertNoHorizontalScroll(narrowPage, "landing 375");
  await narrowPage.goto(`${base}/coach`, { waitUntil: "networkidle" });
  await narrowPage.getByTestId("platform-email").click();
  await narrowPage.getByTestId("answer-0").waitFor();
  await assertNoHorizontalScroll(narrowPage, "email question 375");
  await narrow.close();

  const question = await open(mobile, `${base}/coach`);
  await question.getByTestId("platform-instagram").click();
  await question.getByTestId("answer-0").waitFor();
  await assertNoHorizontalScroll(question, "question 390");
  await shot(question, "coach-question-mobile.png");

  const riya = await open(mobile, `${base}/coach?persona=riya`);
  const riyaResults = riya.getByTestId("results");
  await riyaResults.waitFor();
  await riya.getByText("1/12").waitFor();
  await riya.getByRole("heading", { name: "Passive" }).waitFor();
  const riyaText = await riyaResults.innerText();
  if (
    !riyaText.includes("No tangle for you") ||
    !riyaText.includes("0.00") ||
    !riyaText.includes("Dyadic") ||
    /acts like a pipe/i.test(riyaText) ||
    /Core Φ/.test(riyaText)
  ) {
    throw new Error(`Riya triad text missing computed values:\n${riyaText}`);
  }
  if (/major complex/i.test(riyaText)) {
    throw new Error("major complex should not appear on the results card");
  }
  await assertNoHorizontalScroll(riya, "riya 390");
  await shot(riya, "results-riya-mobile.png");

  const sam = await open(mobile, `${base}/coach?persona=sam`);
  await sam.getByTestId("results").waitFor();
  await sam.getByText("11/12").waitFor();
  await sam.getByRole("heading", { name: "Deliberate" }).waitFor();
  const samText = await sam.getByTestId("results").innerText();
  if (
    !samText.includes("You're in the game and steering it.") ||
    !samText.includes("0.42") ||
    !samText.includes("you + the ranker") ||
    /Core Φ/.test(samText)
  ) {
    throw new Error(`Sam triad text missing computed values:\n${samText}`);
  }
  const samHeadline = "You're in the game and steering it.";
  if (samText.split(samHeadline).length - 1 !== 1) {
    throw new Error("Sam headline is duplicated");
  }
  await shot(sam, "results-sam-mobile.png");
  await sam.getByTestId("toggle-alternatives").click();
  await sam.getByTestId("change-note").waitFor();
  const samNote = await sam.getByTestId("change-note").innerText();
  if (!/tangle gets bigger/i.test(samNote)) {
    throw new Error(`Sam what-if note missing:\n${samNote}`);
  }
  await shot(sam, "what-if-mobile.png");

  const email = await open(mobile, `${base}/coach`);
  await email.getByTestId("platform-email").click();
  for (let i = 0; i < 6; i += 1) {
    await email.getByTestId("answer-0").click();
  }
  const emailResults = email.getByTestId("results");
  await emailResults.waitFor();
  const emailText = await emailResults.innerText();
  if (
    !emailText.includes("There's no tangle here: Email acts like a pipe") ||
    !emailText.includes("Dyadic") ||
    !emailText.includes("0.00") ||
    !emailText.includes("A'=U; U'=U; C'=A") ||
    /part of the tangle|outside the tangle/i.test(emailText)
  ) {
    throw new Error(`Email card should show the computed dyadic verdict:\n${emailText}`);
  }
  if (emailText.includes("U'=C")) {
    throw new Error("Email must use the forward-only rule U'=U");
  }
  if (/Core Φ/.test(emailText)) throw new Error("Core Φ must not appear");

  const uber = await open(mobile, `${base}/coach`);
  await uber.getByTestId("platform-uber").click();
  for (let i = 0; i < 6; i += 1) await uber.getByTestId("answer-0").click();
  await uber.getByTestId("results").waitFor();
  await uber.getByTestId("toggle-adapts").click();
  const uberNote = await uber.getByTestId("change-note").innerText();
  if (!/takes you out of the tangle|A knot forms/i.test(uberNote)) {
    throw new Error(`Uber adapts-on note missing:\n${uberNote}`);
  }
  console.log(`uber no-alternatives adapts-on note: ${uberNote}`);

  const aboutNarrow = await browser.newContext({ viewport: { width: 375, height: 812 } });
  await aboutNarrow.addInitScript(forceLight);
  const about = await open(aboutNarrow, `${base}/about`);
  await about.getByRole("heading", { name: "The research behind it" }).waitFor();
  await assertNoHorizontalScroll(about, "about 375");
  await shot(about, "about-mobile.png");
  await aboutNarrow.close();

  await riya.getByRole("button", { name: "Share my result" }).click();
  await riya.getByText("Copied.").waitFor();
  const copied = await riya.evaluate(() => navigator.clipboard.readText());
  const expected = `I scored Passive (1/12) on Instagram with Algorithmacy Coach: ${base}`;
  if (copied !== expected) {
    throw new Error(`Share text mismatch:\n${copied}\n${expected}`);
  }

  const qr = await open(mobile, `${base}/qr`);
  await qr.getByRole("img").waitFor();
  await assertNoHorizontalScroll(qr, "qr 390");

  const before = await landingMobile.evaluate(() => document.documentElement.classList.contains("dark"));
  await landingMobile.getByRole("button", { name: "Toggle color theme" }).click();
  const after = await landingMobile.evaluate(() => document.documentElement.classList.contains("dark"));
  if (before === after) throw new Error("Dark mode toggle did not change the theme class");

  await browser.close();
  console.log(`screenshots written to ${outDir}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
