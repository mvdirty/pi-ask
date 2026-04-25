import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Text, truncateToWidth } from "@mariozechner/pi-tui";
import { renderResultText } from "./result.ts";
import { AskParamsSchema } from "./schema.ts";
import { createInitialState } from "./state/create.ts";
import { collectValidationIssues } from "./state/normalize.ts";
import { summarizeResult, toAskResult } from "./state/result.ts";
import type {
	AskParams,
	AskQuestionInput,
	AskResult,
	AskValidationIssue,
} from "./types.ts";
import { UI_DIMENSIONS } from "./ui/constants.ts";
import { runAskFlow } from "./ui/controller.ts";

export function registerAskTool(pi: ExtensionAPI) {
	pi.registerTool({
		name: "ask_user",
		label: "Ask User",
		description:
			"Interactive clarification tool for cases where the next step depends on user preferences, missing requirements, or choosing between multiple valid directions. Ask a short structured interview, collect normalized answers, and continue using those answers explicitly instead of guessing. Supports single-select, multi-select, and preview-pane questions. Always include a machine-readable `value` for every option. Use `preview` only when every option includes `preview` text; descriptions alone are not enough.",
		promptSnippet:
			"Clarify ambiguous or preference-sensitive decisions with a short interactive interview before proceeding",
		promptGuidelines: [
			"Use this tool before making preference-sensitive decisions about scope, tone, UX, naming, architecture, docs, or implementation direction.",
			"When multiple valid directions exist, ask 1-3 concise questions instead of committing to one path on your own.",
			"Prefer one focused decision per question and use short labels with 2-4 clear options.",
			"Always include a non-empty `value` for every option.",
			'Use `type: "single"` by default and `type: "multi"` only when several answers can genuinely apply.',
			'Use `type: "preview"` only when every option includes non-empty `preview` text for the dedicated preview pane. Option descriptions do not satisfy this requirement.',
			"After clarifying a note or follow-up question, prefer another structured ask_user follow-up if a choice is still needed instead of switching to plain-text multiple choice in chat.",
			"When prior answers already narrow the branch, bundle the next 2-3 related unresolved decisions into one follow-up ask instead of issuing a long sequence of single-question asks.",
			"Use one-at-a-time follow-up asks only when the next question materially depends on the previous answer.",
		],
		parameters: AskParamsSchema,

		async execute(_toolCallId, params: AskParams, _signal, _onUpdate, ctx) {
			const validation = validateParams(params);
			if (!validation.ok) {
				return {
					content: [
						{ type: "text", text: formatValidationError(validation.issues) },
					],
					details: errorResultDetails(params, validation.issues),
				};
			}

			if (!ctx.hasUI) {
				return {
					content: [
						{
							type: "text",
							text: formatNonInteractiveMessage(validation.state),
						},
					],
					details: {
						...toAskResult(validation.state),
						cancelled: true,
					},
				};
			}

			const result = await runAskFlow(ctx, params);
			return {
				content: [{ type: "text", text: summarizeResult(result) }],
				details: result,
			};
		},

		renderCall(args, theme) {
			const params = args as AskParams;
			const labels = Array.isArray(params.questions)
				? params.questions
						.map(
							(question: AskQuestionInput, index) =>
								question.label || `Q${index + 1}`
						)
						.join(", ")
				: "";
			let text = theme.fg("toolTitle", theme.bold("ask_user "));
			text += theme.fg("muted", `${params.questions?.length ?? 0} question(s)`);
			if (labels) {
				text += theme.fg(
					"dim",
					` (${truncateToWidth(labels, UI_DIMENSIONS.callLabelTruncateWidth)})`
				);
			}
			return new Text(text, 0, 0);
		},

		renderResult(result, _options, theme) {
			const details = result.details as AskResult | undefined;
			if (!details) {
				const text = result.content[0];
				return new Text(text?.type === "text" ? text.text : "", 0, 0);
			}

			if (details.error) {
				return new Text(theme.fg("warning", "Invalid input"), 0, 0);
			}
			if (details.cancelled) {
				return new Text(theme.fg("warning", "Cancelled"), 0, 0);
			}

			return new Text(renderResultText(details), 0, 0);
		},
	});
}

function errorResultDetails(
	params: AskParams,
	issues: AskValidationIssue[]
): AskResult {
	try {
		const state = createInitialState(params);
		return {
			...toAskResult(state),
			cancelled: true,
			error: {
				kind: "invalid_input",
				issues,
			},
		};
	} catch {
		return {
			title: params.title,
			cancelled: true,
			mode: "submit",
			questions: [],
			answers: {},
			error: {
				kind: "invalid_input",
				issues,
			},
		};
	}
}

function validateParams(
	params: AskParams
):
	| { ok: true; state: ReturnType<typeof createInitialState> }
	| { ok: false; issues: AskValidationIssue[] } {
	const issues = collectValidationIssues(params);
	if (issues.length > 0) {
		return {
			ok: false,
			issues,
		};
	}

	return {
		ok: true,
		state: createInitialState(params),
	};
}

function formatValidationError(issues: AskValidationIssue[]): string {
	const lines = [
		"Invalid ask_user payload:",
		...issues.map((issue) => `- ${issue.path}: ${issue.message}`),
	];
	return lines.join("\n");
}

function formatNonInteractiveMessage(
	state: ReturnType<typeof createInitialState>
): string {
	const lines = [
		"Needs user input: ask_user requires interactive UI.",
		"Run same tool call in interactive session, or ask user these questions manually:",
	];

	for (const [index, question] of state.questions.entries()) {
		lines.push(`${index + 1}. ${question.label}: ${question.prompt}`);
		for (const option of question.options) {
			lines.push(`   - ${option.label} [${option.value}]`);
		}
		lines.push("   - Type your own [custom]");
	}

	lines.push(
		"details.questions contains normalized pending questions. details.answers stays empty until user responds."
	);
	return lines.join("\n");
}
