import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { beforeAll, describe, expect, it } from "vitest";

import Background from "../../src/components/Background.astro";
import Watermark from "../../src/components/Watermark.astro";
import BaseLayout from "../../src/layouts/BaseLayout.astro";

let container: AstroContainer;

async function renderLayout(): Promise<string> {
	return container.renderToString(BaseLayout, {
		props: { title: "Test" },
		slots: { default: '<p id="fallback-body">fallback content</p>' },
	});
}

beforeAll(async () => {
	container = await AstroContainer.create();
});

describe("BaseLayout", () => {
	it("includes the ClientRouter view-transitions runtime in the head", async () => {
		const html = await renderLayout();
		const head = html.slice(html.indexOf("<head>"), html.indexOf("</head>"));

		expect(head).toContain("astro-view-transitions-enabled");
		expect(head).toMatch(/astro-view-transitions-fallback"[^>]*content="none"/);
		expect(head).toContain("ClientRouter.astro?astro&type=script");
	});

	it("keeps the full-page fallback content valid when transitions are present", async () => {
		const html = await renderLayout();

		expect(html).toContain('<p id="fallback-body">fallback content</p>');
	});

	it("keys the html element with data-route for the current route", async () => {
		const html = await renderLayout();
		const htmlTag = html.match(/<html[^>]*>/)?.[0] ?? "";

		expect(htmlTag).toContain('data-route="shell"');
	});

	it("keys html[data-route] to the view route on view requests", async () => {
		const html = await container.renderToString(BaseLayout, {
			props: { title: "About" },
			request: new Request("http://localhost:4321/about"),
			slots: { default: "<p>view content</p>" },
		});
		const htmlTag = html.match(/<html[^>]*>/)?.[0] ?? "";

		expect(htmlTag).toContain('data-route="about"');
	});

	it("never pre-applies the no-scroll gate server-side: data-game-ready is enhancement-only", async () => {
		const html = await renderLayout();
		const htmlTag = html.match(/<html[^>]*>/)?.[0] ?? "";

		expect(htmlTag).not.toContain("data-game-ready");
		expect(htmlTag).not.toContain("overflow");
	});
});

describe("Background", () => {
	it("marks the canvas transition:persist while staying hidden until init", async () => {
		const html = await container.renderToString(Background);
		const canvas = html.match(/<canvas[^>]*>/);

		expect(canvas).not.toBeNull();
		expect(canvas?.[0]).toContain("data-astro-transition-persist");
		expect(canvas?.[0]).toContain('id="living-background"');
		expect(canvas?.[0]).toContain('aria-hidden="true"');
		expect(canvas?.[0]).toContain("hidden");
	});
});

describe("Watermark", () => {
	it("renders decorative text hidden from assistive technology", async () => {
		const html = await container.renderToString(Watermark, {
			props: { text: "WORK" },
		});

		expect(html).toContain('aria-hidden="true"');
		expect(html).toContain("WORK");
	});
});
