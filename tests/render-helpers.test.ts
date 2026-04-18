import assert from "node:assert/strict";
import test from "node:test";
import { renderEditorBlock } from "../src/ui/render-helpers.ts";

function mockTheme() {
	return {
		fg(color: string, text: string) {
			return `<${color}>${text}</${color}>`;
		},
		bg(color: string, text: string) {
			return `{${color}}${text}{/${color}}`;
		},
	};
}

test("renderEditorBlock strips editor borders", () => {
	const lines: string[] = [];
	renderEditorBlock({
		lines,
		editorLines: ["┌──┐", "│abc│", "└──┘"],
		width: 40,
		theme: mockTheme() as never,
		indent: "   ",
		availableWidth: 40,
	});

	assert.equal(lines.length, 1);
	assert.match(lines[0], /abc/);
	assert.doesNotMatch(lines[0], /┌|└/);
});

test("renderEditorBlock shows a muted placeholder when empty", () => {
	const lines: string[] = [];
	renderEditorBlock({
		lines,
		editorLines: ["┌──┐", "│  │", "└──┘"],
		width: 40,
		theme: mockTheme() as never,
		indent: "   ",
		availableWidth: 40,
		placeholder: "Type your",
		isEmpty: true,
	});

	assert.equal(lines.length, 1);
	assert.match(lines[0], /Type your/);
	assert.doesNotMatch(lines[0], /┌|└/);
});
