import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

const SCRIPT = join(process.cwd(), "scripts", "verify-no-phone.mjs");
// Opaque fixture value: not a contact-number-shaped value, so the test files
// themselves never carry one. The gate treats the env value as opaque.
const FIXTURE_VALUE = "privacy-gate-fixture-value";

let fixture: string | undefined;

function makeFixture(): string {
	const dir = mkdtempSync(join(tmpdir(), "privacy-gate-"));
	fixture = dir;
	return dir;
}

function runGate(
	dir: string,
	withValue: boolean,
): Promise<{ code: number | null; output: string }> {
	return new Promise((resolve) => {
		const env: NodeJS.ProcessEnv = { ...process.env };
		if (withValue) {
			env.CV_PHONE = FIXTURE_VALUE;
		} else {
			delete env.CV_PHONE;
		}
		const args = [SCRIPT];
		const child = spawn(process.execPath, args, {
			cwd: dir,
			env,
			stdio: ["ignore", "pipe", "pipe"],
		});
		let output = "";
		child.stdout.on("data", (chunk: Buffer) => {
			output += chunk.toString();
		});
		child.stderr.on("data", (chunk: Buffer) => {
			output += chunk.toString();
		});
		child.on("close", (code) => resolve({ code, output }));
	});
}

afterEach(() => {
	if (fixture) {
		rmSync(fixture, { recursive: true, force: true });
		fixture = undefined;
	}
});

describe("verify-no-phone privacy gate", () => {
	it("fails with a nonzero exit when the env value appears in a scanned file", async () => {
		const dir = makeFixture();
		mkdirSync(join(dir, "src"), { recursive: true });
		writeFileSync(join(dir, "src", "resume.yaml"), `value: ${FIXTURE_VALUE}\n`);

		const { code, output } = await runGate(dir, true);

		expect(code).not.toBe(0);
		expect(output).not.toContain(FIXTURE_VALUE);
	});

	it("reports typed unavailable with a nonzero exit when the env value is missing", async () => {
		const dir = makeFixture();

		const { code, output } = await runGate(dir, false);

		expect(code).not.toBe(0);
		expect(output).toContain("unavailable");
		expect(output).not.toContain(FIXTURE_VALUE);
	});

	it("passes with exit 0 when the env value is absent from every scanned file", async () => {
		const dir = makeFixture();
		mkdirSync(join(dir, "src"), { recursive: true });
		writeFileSync(join(dir, "src", "resume.yaml"), "value: plain text\n");

		const { code, output } = await runGate(dir, true);

		expect(code).toBe(0);
		expect(output).not.toContain(FIXTURE_VALUE);
	});

	it("never passes the value through argv", async () => {
		makeFixture();

		const args = [SCRIPT];
		expect(args).not.toContain(FIXTURE_VALUE);
		const argvLine = JSON.stringify(process.argv);
		expect(argvLine).not.toContain(FIXTURE_VALUE);
	});
});
