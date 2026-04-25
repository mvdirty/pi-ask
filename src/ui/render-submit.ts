import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";
import { SUBMIT_CHOICES } from "../constants.ts";
import { serializeAnswer } from "../state/answers.ts";
import type { AskResult, AskState, AskStateAnswer } from "../types.ts";
import { UI_DIMENSIONS, UI_TEXT } from "./constants.ts";
import { mergeColumns, pushWrappedText } from "./render-helpers.ts";
import type { Theme } from "./render-types.ts";

type ReviewAnswer = AskResult["answers"][string] & {
	extraOptionNotes?: Array<{
		label: string;
		note: string;
	}>;
};

export function renderSubmitScreen(
	lines: string[],
	state: AskState,
	theme: Theme,
	width: number
) {
	const showAllNotes = state.activeSubmitActionIndex === 1;

	if (shouldUseWideSubmitLayout(width)) {
		const leftWidth = UI_DIMENSIONS.submitActionsWidth;
		const rightWidth = Math.max(1, width - leftWidth - 2);
		const reviewLines = renderSubmitReviewLines(
			state,
			theme,
			rightWidth,
			showAllNotes
		);
		const actionLines = renderSubmitActionLines(state, theme, leftWidth);
		for (const line of mergeColumns(
			actionLines,
			reviewLines,
			leftWidth,
			width
		)) {
			lines.push(line);
		}
		return;
	}

	const reviewLines = renderSubmitReviewLines(
		state,
		theme,
		width,
		showAllNotes
	);
	const actionLines = renderSubmitActionLines(state, theme, width);
	lines.push(...reviewLines);
	lines.push("");
	lines.push(...actionLines);
}

function renderSubmitReviewLines(
	state: AskState,
	theme: Theme,
	width: number,
	showAllNotes: boolean
): string[] {
	const lines: string[] = [];
	pushWrappedText(lines, UI_TEXT.reviewTitle, width, theme, "accent", " ", " ");
	lines.push("");

	for (let index = 0; index < state.questions.length; index++) {
		const question = state.questions[index];
		renderSubmittedQuestion(
			lines,
			question,
			toReviewAnswer(question, state.answers[question.id], showAllNotes),
			theme,
			width
		);
		if (index < state.questions.length - 1) {
			lines.push("");
		}
	}

	return lines;
}

function renderSubmitActionLines(
	state: AskState,
	theme: Theme,
	width: number
): string[] {
	const lines: string[] = [];
	renderSubmitActions(lines, state, theme, width);
	return lines;
}

function shouldUseWideSubmitLayout(width: number): boolean {
	return width >= UI_DIMENSIONS.submitWideMinWidth;
}

function renderSubmittedQuestion(
	lines: string[],
	question: AskState["questions"][number],
	answer: ReviewAnswer | undefined,
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
	answer: ReviewAnswer,
	theme: Theme,
	width: number
) {
	if (answer.note) {
		renderSubmittedNote(lines, answer.note, theme, width);
	}

	if (shouldRenderAnswersIndividually(answer)) {
		renderSubmittedSelections(lines, answer, theme, width);
		renderExtraOptionNotes(lines, answer, theme, width);
		return;
	}

	const answerText = answer.labels.join(", ");
	if (answerText) {
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

	renderExtraOptionNotes(lines, answer, theme, width);
}

function renderSubmittedSelections(
	lines: string[],
	answer: ReviewAnswer,
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

function shouldRenderAnswersIndividually(answer: ReviewAnswer): boolean {
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

function renderLabeledSubmittedNote(
	lines: string[],
	label: string,
	note: string,
	theme: Theme,
	width: number
) {
	const indent = "     ";
	const title = `${label} ${UI_TEXT.questionNoteTitle}`;
	const notePrefix = `${indent}${theme.fg("syntaxString", title)} `;
	const continuationPrefix = `${indent}${" ".repeat(visibleWidth(title) + 1)}`;
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

function renderExtraOptionNotes(
	lines: string[],
	answer: ReviewAnswer,
	theme: Theme,
	width: number
) {
	for (const option of answer.extraOptionNotes ?? []) {
		renderLabeledSubmittedNote(lines, option.label, option.note, theme, width);
	}
}

function isCustomOnlyAnswer(answer: AskResult["answers"][string]): boolean {
	return answer.indices.length === 0 && !!answer.customText;
}

function toReviewAnswer(
	question: AskState["questions"][number],
	answer: AskStateAnswer | undefined,
	showAllNotes: boolean
): ReviewAnswer | undefined {
	if (!answer) {
		return;
	}

	const serialized = serializeAnswer(answer);
	const hasSelectedAnswer = serialized.labels.length > 0;
	if (!showAllNotes) {
		return hasSelectedAnswer ? serialized : undefined;
	}

	const selectedValues = new Set(serialized.values);
	const extraOptionNotes = Object.entries(answer.optionNotes ?? {})
		.filter(([value, note]) => !selectedValues.has(value) && Boolean(note))
		.map(([value, note]) => {
			const option = question.options.find(
				(candidate) => candidate.value === value
			);
			return option ? { label: option.label, note } : undefined;
		})
		.filter((entry): entry is { label: string; note: string } =>
			Boolean(entry)
		);

	if (
		!(hasSelectedAnswer || serialized.note) &&
		extraOptionNotes.length === 0
	) {
		return;
	}

	return {
		...serialized,
		extraOptionNotes:
			extraOptionNotes.length > 0 ? extraOptionNotes : undefined,
	};
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
