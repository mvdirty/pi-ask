import assert from "node:assert/strict";
import test from "node:test";
import { createInitialState } from "../src/state/create.ts";
import {
	applyNumberShortcut,
	enterQuestionNoteMode,
} from "../src/state/transitions.ts";
import { getInputCommand } from "../src/ui/input.ts";

function inputState() {
	let state = createInitialState({
		questions: [
			{
				id: "q1",
				prompt: "Question?",
				options: [{ value: "a", label: "A" }],
			},
		],
	});
	state = applyNumberShortcut(state, 2);
	return state;
}

test("empty typing mode uses arrows and tab for navigation", () => {
	const input = inputState();

	assert.deepEqual(getInputCommand(input, "\x1b[A", ""), {
		kind: "editMoveOption",
		delta: -1,
	});
	assert.deepEqual(getInputCommand(input, "\x1b[B", ""), {
		kind: "editMoveOption",
		delta: 1,
	});
	assert.deepEqual(getInputCommand(input, "\x1b[C", ""), {
		kind: "editMoveTab",
		delta: 1,
	});
	assert.deepEqual(getInputCommand(input, "\x1b[D", ""), {
		kind: "editMoveTab",
		delta: -1,
	});
	assert.deepEqual(getInputCommand(input, "\t", ""), {
		kind: "editMoveTab",
		delta: 1,
	});
	assert.deepEqual(getInputCommand(input, "\x1b[Z", ""), {
		kind: "editMoveTab",
		delta: -1,
	});
});

test("non-empty typing mode keeps arrows and tab in editor", () => {
	const input = inputState();

	assert.deepEqual(getInputCommand(input, "\x1b[A", "x"), {
		kind: "delegateToEditor",
	});
	assert.deepEqual(getInputCommand(input, "\x1b[B", "x"), {
		kind: "delegateToEditor",
	});
	assert.deepEqual(getInputCommand(input, "\x1b[C", "x"), {
		kind: "delegateToEditor",
	});
	assert.deepEqual(getInputCommand(input, "\x1b[D", "x"), {
		kind: "delegateToEditor",
	});
	assert.deepEqual(getInputCommand(input, "\t", "x"), {
		kind: "delegateToEditor",
	});
	assert.deepEqual(getInputCommand(input, "\x1b[Z", "x"), {
		kind: "delegateToEditor",
	});
});

test("empty note editing mode uses arrows and tab for navigation", () => {
	const state = enterQuestionNoteMode(
		createInitialState({
			questions: [
				{
					id: "q1",
					prompt: "Question?",
					options: [{ value: "a", label: "A" }],
				},
			],
		}),
		"q1"
	);

	assert.deepEqual(getInputCommand(state, "\x1b[A", ""), {
		kind: "editMoveOption",
		delta: -1,
	});
	assert.deepEqual(getInputCommand(state, "\x1b[B", ""), {
		kind: "editMoveOption",
		delta: 1,
	});
	assert.deepEqual(getInputCommand(state, "\x1b[C", ""), {
		kind: "editMoveTab",
		delta: 1,
	});
	assert.deepEqual(getInputCommand(state, "\x1b[D", ""), {
		kind: "editMoveTab",
		delta: -1,
	});
	assert.deepEqual(getInputCommand(state, "\t", ""), {
		kind: "editMoveTab",
		delta: 1,
	});
});

test("non-empty note editing mode keeps arrows and tab in editor", () => {
	const state = enterQuestionNoteMode(
		createInitialState({
			questions: [
				{
					id: "q1",
					prompt: "Question?",
					options: [{ value: "a", label: "A" }],
				},
			],
		}),
		"q1"
	);

	assert.deepEqual(getInputCommand(state, "\x1b[A", "x"), {
		kind: "delegateToEditor",
	});
	assert.deepEqual(getInputCommand(state, "\x1b[B", "x"), {
		kind: "delegateToEditor",
	});
	assert.deepEqual(getInputCommand(state, "\x1b[C", "x"), {
		kind: "delegateToEditor",
	});
	assert.deepEqual(getInputCommand(state, "\x1b[D", "x"), {
		kind: "delegateToEditor",
	});
	assert.deepEqual(getInputCommand(state, "\t", "x"), {
		kind: "delegateToEditor",
	});
});

test("ctrl+c dismisses the flow from both navigation and editing modes", () => {
	const navigation = createInitialState({
		questions: [
			{
				id: "q1",
				prompt: "Question?",
				options: [{ value: "a", label: "A" }],
			},
		],
	});
	const input = inputState();
	const note = enterQuestionNoteMode(navigation, "q1");

	assert.deepEqual(getInputCommand(navigation, "\u0003"), {
		kind: "dismiss",
	});
	assert.deepEqual(getInputCommand(input, "\u0003"), {
		kind: "dismiss",
	});
	assert.deepEqual(getInputCommand(note, "\u0003"), {
		kind: "dismiss",
	});
});

test("question mark opens keymap help outside non-empty editors", () => {
	const navigation = createInitialState({
		questions: [
			{
				id: "q1",
				prompt: "Question?",
				options: [{ value: "a", label: "A" }],
			},
		],
	});
	const input = inputState();

	assert.deepEqual(getInputCommand(navigation, "?"), { kind: "showHelp" });
	assert.deepEqual(getInputCommand(input, "?", ""), { kind: "showHelp" });
	assert.deepEqual(getInputCommand(input, "?", "x"), {
		kind: "delegateToEditor",
	});
});

test("note shortcuts use n for option notes and Shift+N for question notes", () => {
	const navigation = createInitialState({
		questions: [
			{
				id: "q1",
				prompt: "Question?",
				options: [{ value: "a", label: "A" }],
			},
		],
	});

	assert.deepEqual(getInputCommand(navigation, "n"), {
		kind: "openOptionNote",
	});
	assert.deepEqual(getInputCommand(navigation, "N"), {
		kind: "openQuestionNote",
	});
});
