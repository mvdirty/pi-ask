import assert from "node:assert/strict";
import test from "node:test";
import { visibleWidth } from "@mariozechner/pi-tui";
import { ASK_HELP_CLOSE_HINT, ASK_KEYMAPS } from "../src/constants/keymaps.ts";
import { AskHelpModal } from "../src/ui/help-modal.ts";

const noop = () => {
	// Test callback intentionally does nothing.
};

function plainTheme() {
	return {
		fg(_color: string, text: string) {
			return text;
		},
		bg(_color: string, text: string) {
			return text;
		},
	};
}

test("help modal renders compactly on phone-width screens", () => {
	const modal = new AskHelpModal(plainTheme(), noop);
	const lines = modal.render(28);

	assert(lines.length > ASK_KEYMAPS.length + 4);
	assert(lines.every((line) => visibleWidth(line) <= 28));
	assert(lines.join("\n").includes("@eko24ive/pi-ask"));
	assert(lines.slice(-3, -1).join(" ").includes("Esc, Ctrl+C, or ?"));
	assert(lines.includes("│ ?                        │"));
	assert(lines.includes("│   Show this menu         │"));
});

test("help modal keeps context rows on wider screens", () => {
	const modal = new AskHelpModal(plainTheme(), noop);
	const lines = modal.render(72);

	assert(lines.length > ASK_KEYMAPS.length + 4);
	assert(lines.join("\n").includes("Main flow"));
	assert(lines.at(-2)?.includes(ASK_HELP_CLOSE_HINT));
});

test("help modal closes from configured keyboard shortcuts", () => {
	for (const input of ["?", "\u001b", "\u0003"]) {
		let closed = 0;
		const modal = new AskHelpModal(plainTheme(), () => {
			closed += 1;
		});

		modal.handleInput(input);

		assert.equal(closed, 1);
	}
});

test("help modal ignores enter and closes idempotently on dispose", () => {
	let closed = 0;
	const modal = new AskHelpModal(plainTheme(), () => {
		closed += 1;
	});

	modal.handleInput("\r");
	assert.equal(closed, 0);

	modal.dispose();
	modal.dispose();
	assert.equal(closed, 1);
});
