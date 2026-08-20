import { expect, test } from "@playwright/test";

test("skills PR2", async ({ page }) => {
	const check = async (w: number, h: number, rail: boolean) => {
		await page.setViewportSize({ width: w, height: h });
		await page.goto("/skills");
		await expect(page.locator("[data-skill-slot]")).toHaveCount(5);
		// biome-ignore format: compact
		const d=await page.evaluate(()=>{const s=[...document.querySelectorAll<HTMLElement>("[data-skill-slot]")].map(e=>e.getBoundingClientRect());const dy=getComputedStyle(document.querySelector(".skills-scroll-region") as HTMLElement).getPropertyValue("--skill-dy").trim();const hd=document.querySelector("header")?.getBoundingClientRect();const hs=document.querySelector(".key-hints")?.getBoundingClientRect();const l=s.at(-1) as unknown as DOMRect;return{s,dy,cardW:s[0].width,dx:s[1].x-s[0].x,pitch:s[1].y-s[0].y,trans:[...document.querySelectorAll<HTMLElement>("[data-skill-slot]")].map(e=>getComputedStyle(e).transform),hdrB:hd?.bottom??0,firstT:s[0].top,lastB:l.bottom,lastCalc:l.y+l.height,vpW:innerWidth,vpH:innerHeight,reserve:(hs?.top??innerHeight)-l.bottom}});
		expect(d.dy).toBe("");
		// biome-ignore format: y
		for(let i=0;i<d.s.length;i++)expect(Math.abs(d.s[i].y-(d.s[0].y+i*d.pitch))).toBeLessThan(2);
		// biome-ignore format: ty
		for(const t of d.trans)if(t!=="none"){const m=t.match(/matrix.*\((.+)\)/);if(m)expect(Math.abs(parseFloat(m[1].split(",")[5]??"0"))).toBeLessThan(1.5);}
		expect(d.dx / d.cardW).toBeGreaterThanOrEqual(0.05);
		expect(d.dx / d.cardW).toBeLessThanOrEqual(0.08);
		const a = (Math.atan2(d.pitch, d.dx) * 180) / Math.PI;
		expect(a).toBeGreaterThanOrEqual(74);
		expect(a).toBeLessThanOrEqual(78);
		expect(Math.abs(d.lastB - d.lastCalc)).toBeLessThan(0.5);
		expect(d.firstT).toBeGreaterThan(d.hdrB + 2);
		expect(d.reserve).toBeGreaterThanOrEqual(8);
		expect(d.lastB).toBeLessThanOrEqual(d.vpH + 0.5);
		// biome-ignore format: clip
		for(const r of d.s){expect(r.left).toBeGreaterThanOrEqual(-1);expect(r.right).toBeLessThanOrEqual(d.vpW+1);}
		if (rail) {
			// biome-ignore format: rail
			const i=await page.evaluate(()=>{const r=[...document.querySelectorAll<HTMLElement>("[data-skill-slot]")].map(e=>e.getBoundingClientRect());const dx=r[1].x-r[0].x,pitch=r[1].y-r[0].y;const rail=document.querySelector<HTMLElement>(".skills-rail") as HTMLElement;const rc=rail.getBoundingClientRect();const tr=getComputedStyle(rail).transform;let ang=null;if(tr!=="none")ang=Math.atan2(new DOMMatrix(tr).b,new DOMMatrix(tr).a)*180/Math.PI;const band=Math.atan2(-innerHeight,innerWidth*0.65)*180/Math.PI;return{dx,pitch,rc,ang,band,cards:r,list:(document.querySelector(".skills-viewport [data-list]") as HTMLElement).getBoundingClientRect(),persona:(document.querySelector<HTMLElement>(".skills-persona") as HTMLElement).getBoundingClientRect()}});
			expect(
				Math.abs(
					Math.max(i.rc.width, i.rc.height) - Math.hypot(4 * i.dx, 4 * i.pitch),
				),
			).toBeLessThan(40);
			expect(Math.abs(i.rc.top - i.cards[0].y)).toBeLessThan(16);
			const e = (-Math.atan2(i.dx, i.pitch) * 180) / Math.PI;
			expect(i.ang).not.toBeNull();
			expect(Math.abs((i.ang as number) - e)).toBeLessThan(4);
			expect(Math.abs((i.ang as number) - i.band)).toBeGreaterThan(15);
			expect(i.rc.left + 8).toBeLessThan(i.list.left);
			for (const c of i.cards) expect(i.rc.left + 8).toBeLessThan(c.left);
			expect(
				!(
					i.rc.right < i.persona.left ||
					i.rc.left > i.persona.right ||
					i.rc.bottom < i.persona.top ||
					i.rc.top > i.persona.bottom
				),
			).toBe(false);
		}
	};
	await check(2000, 1082, true);
	await check(1280, 720, false);
});
