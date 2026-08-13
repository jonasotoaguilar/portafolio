import { expect, test } from "@playwright/test";

// portfolio-content: the CONTACT destinations must resolve. The email CTA is
// a mailto href contract (not fetchable); GitHub and WealthQuest are probed
// over HTTP. If the network is entirely unavailable the reachability claim is
// skipped with a typed message — never fabricated — while href contracts are
// still asserted.
const CONTACT_URLS = [
	["GitHub", "https://github.com/jonasotoaguilar"],
	["WealthQuest", "https://jonasotoaguilar.itch.io/wealthquest"],
] as const;

test.describe("CONTACT external destinations", () => {
	test("email CTA exposes the exact mailto href contract", async ({ page }) => {
		await page.goto("/contact");
		await expect(
			page.getByRole("link", { name: "jonathansoto.dev@gmail.com" }),
		).toHaveAttribute("href", "mailto:jonathansoto.dev@gmail.com");
	});

	test("GitHub profile and WealthQuest itch.io URLs resolve over HTTP", async ({
		page,
		request,
	}) => {
		await page.goto("/contact");
		const results: { url: string; status: number | null; failed: boolean }[] =
			[];
		for (const [label, url] of CONTACT_URLS) {
			await expect(page.getByRole("link", { name: label })).toHaveAttribute(
				"href",
				url,
			);
			try {
				const response = await request.get(url, {
					timeout: 15_000,
					failOnStatusCode: false,
				});
				results.push({ url, status: response.status(), failed: false });
			} catch (error) {
				console.log(
					`reachability probe unavailable for ${url}: ${(error as Error).message}`,
				);
				results.push({ url, status: null, failed: true });
			}
		}
		console.log(
			`reachability results: ${results
				.map((r) => `${r.url} -> ${r.status ?? "unavailable"}`)
				.join(", ")}`,
		);
		if (results.every((r) => r.failed)) {
			test.skip(
				true,
				"network unavailable: external reachability not asserted; href contracts verified above",
			);
			return;
		}
		for (const result of results) {
			expect(
				result.failed,
				`${result.url} probe must not fail while the network is reachable`,
			).toBe(false);
			expect(result.status).not.toBeNull();
			expect(result.status ?? 0).toBeGreaterThanOrEqual(200);
			expect(result.status ?? 0).toBeLessThan(400);
		}
	});
});
