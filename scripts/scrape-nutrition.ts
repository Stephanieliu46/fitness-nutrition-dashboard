import { chromium } from "playwright";
import * as fs from "fs/promises";
import * as path from "path";

const TARGETS: { url: string; category: string }[] = [
  { url: "https://www.nutritionix.com/food/chicken-breast", category: "Meat & Poultry" },
];

interface ScrapedFood { name: string; calories: number; protein: number; carbs: number; fat: number; category: string; source: string; }

function parseNum(val: string | null | undefined): number {
  if (!val) return 0;
  const n = parseFloat(val.replace(/[^\d.]/g, ""));
  return isNaN(n) ? 0 : n;
}
async function delay(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

async function scrapeNutritionData(): Promise<void> {
  const outputPath = path.join(process.cwd(), "data", "uk-nutrition.json");
  let existing: ScrapedFood[] = [];
  try { existing = JSON.parse(await fs.readFile(outputPath, "utf-8")); console.log(`Loaded ${existing.length} existing entries.`); }
  catch { console.log("No existing data file found — starting fresh."); }

  const scraped: ScrapedFood[] = [];
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ userAgent: "Mozilla/5.0 (compatible; FitTrackBot/1.0)", locale: "en-GB" });
    for (const target of TARGETS) {
      console.log(`Scraping: ${target.url}`);
      try {
        const page = await context.newPage();
        await page.goto(target.url, { waitUntil: "domcontentloaded", timeout: 15000 });
        const name = await page.locator("h1").first().textContent().catch(() => null);
        const rows = await page.locator("table tr").all();
        let calories = 0, protein = 0, carbs = 0, fat = 0;
        for (const row of rows) {
          const cells = await row.locator("td").allTextContents();
          const t = cells.join(" ").toLowerCase();
          if (t.includes("calorie") || t.includes("energy")) calories = parseNum(cells[1]);
          if (t.includes("protein")) protein = parseNum(cells[1]);
          if (t.includes("carbohydrate") || t.includes("total carb")) carbs = parseNum(cells[1]);
          if (t.includes("fat") && !t.includes("saturated")) fat = parseNum(cells[1]);
        }
        if (name && calories > 0) { scraped.push({ name: name.trim(), calories, protein, carbs, fat, category: target.category, source: target.url }); console.log(`  Added: ${name.trim()}`); }
        else { console.warn(`  Skipped: ${target.url}`); }
        await page.close();
      } catch (err) { console.error(`  Error: ${target.url}`, (err as Error).message); }
      await delay(1500);
    }
  } finally { await browser.close(); }

  const map = new Map(existing.map((f) => [f.name, f]));
  for (const food of scraped) map.set(food.name, food);
  const merged = Array.from(map.values()).sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  await fs.writeFile(outputPath, JSON.stringify(merged, null, 2), "utf-8");
  console.log(`\nDone. ${merged.length} entries written.`);
}

scrapeNutritionData().catch((err) => { console.error("Scraper failed:", err); process.exit(1); });
