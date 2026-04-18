import assert from "node:assert/strict";
import test from "node:test";
import { applyNumberShortcut, createInitialState } from "../src/state.ts";
import { getRenderableOptions } from "../src/state/selectors.ts";
import { renderQuestionScreen } from "../src/ui/render-question.ts";

function mockTheme() {
	return {
		fg(color: string, text: string) {
			return `<${color}>${text}</${color}>`;
		},
		bg(color: string, text: string) {
			return `{${color}}${text}{/${color}}`;
		},
		bold(text: string) {
			return text;
		},
	} as never;
}

function mockEditor(text = "") {
	return {
		getText() {
			return text;
		},
		render() {
			return [];
		},
	} as never;
}

test("custom option stays labeled before selection", () => {
	const state = createInitialState({
		questions: [
			{
				id: "q1",
				prompt: "Pick one",
				options: [{ value: "a", label: "A" }],
			},
		],
	});

	const lines: string[] = [];
	renderQuestionScreen({
		lines,
		state,
		question: state.questions[0],
		options: getRenderableOptions(state.questions[0]),
		theme: mockTheme(),
		width: 80,
		editor: mockEditor(),
	});

	assert(lines.some((line) => line.includes("Type your own")));
	assert(!lines.some((line) => line.includes("Type your answer...")));
});

test("selected custom option becomes inline input", () => {
	let state = createInitialState({
		questions: [
			{
				id: "q1",
				prompt: "Pick one",
				options: [{ value: "a", label: "A" }],
			},
		],
	});
	state = applyNumberShortcut(state, 2);

	const lines: string[] = [];
	renderQuestionScreen({
		lines,
		state,
		question: state.questions[0],
		options: getRenderableOptions(state.questions[0]),
		theme: mockTheme(),
		width: 80,
		editor: mockEditor(""),
	});

	assert(lines.some((line) => line.includes("Type your answer...")));
	assert(!lines.some((line) => line.includes("Type your own answer")));
});
