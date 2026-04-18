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

test("editing views let up and down move navigation", () => {
	const input = inputState();
	assert.deepEqual(getInputCommand(input, "\x1b[A"), {
		kind: "editMoveOption",
		delta: -1,
	});
	assert.deepEqual(getInputCommand(input, "\x1b[B"), {
		kind: "editMoveOption",
		delta: 1,
	});
});

test("note editing views let up and down move navigation", () => {
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

	assert.deepEqual(getInputCommand(state, "\x1b[A"), {
		kind: "editMoveOption",
		delta: -1,
	});
	assert.deepEqual(getInputCommand(state, "\x1b[B"), {
		kind: "editMoveOption",
		delta: 1,
	});
});
