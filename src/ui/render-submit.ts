import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";
import { SUBMIT_CHOICES } from "../constants.ts";
import { toAskResult } from "../state/result.ts";
import type { AskResult, AskState } from "../types.ts";
import { UI_TEXT } from "./constants.ts";
import { pushWrappedText } from "./render-helpers.ts";
import type { Theme } from "./render-types.ts";

export function renderSubmitScreen(
	lines: string[],
	state: AskState,
	theme: Theme,
	width: number
) {
	pushWrappedText(lines, UI_TEXT.reviewTitle, width, theme, "accent", " ", " ");
	lines.push("");

	const submittedAnswers = toAskResult(state).answers;
	for (let index = 0; index < state.questions.length; index++) {
		const question = state.questions[index];
		renderSubmittedQuestion(
			lines,
			question,
			submittedAnswers[question.id],
			theme,
			width
		);
		if (index < state.questions.length - 1) {
			lines.push("");
		}
	}

	lines.push("");
	renderSubmitActions(lines, state, theme, width);
}

function renderSubmittedQuestion(
	lines: string[],
	question: AskState["questions"][number],
	answer: AskResult["answers"][string] | undefined,
	theme: Theme,
	width: number
) {
	pushWrappedText(lines, question.label, width, theme, "text", " ", " ");
	if (!answer) {
		lines.push(
			truncateToWidth(`   ${theme.fg("dim", UI_TEXT.unanswered)}`, width)
		);
		return;
	}

	renderSubmittedAnswer(lines, answer, theme, width);
}

function renderSubmittedAnswer(
	lines: string[],
	answer: AskResult["answers"][string],
	theme: Theme,
	width: number
) {
	if (answer.note) {
		renderSubmittedNote(lines, answer.note, theme, width);
	}

	if (shouldRenderAnswersIndividually(answer)) {
		renderSubmittedSelections(lines, answer, theme, width);
		return;
	}

	const answerText = answer.labels.join(", ");
	if (!answerText) {
		return;
	}

	pushWrappedText(
		lines,
		`→ ${answerText}`,
		width,
		theme,
		isCustomOnlyAnswer(answer) ? "text" : "success",
		"   ",
		"     "
	);
}

function renderSubmittedSelections(
	lines: string[],
	answer: AskResult["answers"][string],
	theme: Theme,
	width: number
) {
	for (let index = 0; index < answer.labels.length; index++) {
		const label = answer.labels[index];
		const value = answer.values[index] ?? label;
		pushWrappedText(
			lines,
			`→ ${label}`,
			width,
			theme,
			"success",
			"   ",
			"     "
		);

		const note = answer.optionNotes?.[value];
		if (note) {
			renderSubmittedNote(lines, note, theme, width);
		}
	}
}

function shouldRenderAnswersIndividually(
	answer: AskResult["answers"][string]
): boolean {
	if (!answer.labels.length) {
		return false;
	}

	return (
		answer.labels.length > 1 ||
		Boolean(answer.optionNotes && Object.keys(answer.optionNotes).length > 0)
	);
}

function renderSubmittedNote(
	lines: string[],
	note: string,
	theme: Theme,
	width: number
) {
	const indent = "     ";
	const notePrefix = `${indent}${theme.fg("syntaxString", UI_TEXT.questionNoteTitle)} `;
	const continuationPrefix = `${indent}${" ".repeat(visibleWidth(UI_TEXT.questionNoteTitle) + 1)}`;
	pushWrappedText(
		lines,
		note,
		width,
		theme,
		"muted",
		notePrefix,
		continuationPrefix
	);
}

function isCustomOnlyAnswer(answer: AskResult["answers"][string]): boolean {
	return answer.indices.length === 0 && !!answer.customText;
}

function renderSubmitActions(
	lines: string[],
	state: AskState,
	theme: Theme,
	width: number
) {
	for (let index = 0; index < SUBMIT_CHOICES.length; index++) {
		const selected = index === state.activeSubmitActionIndex;
		const prefix = selected ? "❯ " : "  ";
		pushWrappedText(
			lines,
			`${index + 1}. ${SUBMIT_CHOICES[index]}`,
			width,
			theme,
			selected ? "accent" : "text",
			prefix,
			prefix
		);
	}
}
