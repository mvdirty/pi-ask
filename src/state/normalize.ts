import type {
	AskOption,
	AskParams,
	AskQuestion,
	AskQuestionInput,
	AskValidationIssue,
} from "../types.ts";

export function normalizeQuestions(params: AskParams): AskQuestion[] {
	const issues = collectValidationIssues(params);
	if (issues.length > 0) {
		throw new Error(issues[0]?.message ?? "Invalid ask_user payload");
	}
	return params.questions.map((question, index) =>
		normalizeQuestion(question, index)
	);
}

export function collectValidationIssues(
	params: AskParams
): AskValidationIssue[] {
	const issues: AskValidationIssue[] = [];
	validateQuestions(params.questions, issues);
	return issues;
}

function normalizeQuestion(
	question: AskQuestionInput,
	index: number
): AskQuestion {
	return {
		id: question.id.trim(),
		label: question.label?.trim() || `Q${index + 1}`,
		prompt: question.prompt.trim(),
		type: normalizeQuestionType(question.type),
		required: question.required ?? false,
		options: question.options.map(normalizeOption),
	};
}

function normalizeOption(option: AskOption): AskOption {
	return {
		value: option.value.trim(),
		label: option.label.trim(),
		description: option.description?.trim(),
		preview: option.preview?.trim(),
	};
}

function validateQuestions(
	questions: AskParams["questions"],
	issues: AskValidationIssue[]
): void {
	if (questions.length === 0) {
		issues.push({
			path: "questions",
			message: "At least one question is required",
		});
		return;
	}

	const questionIds = new Set<string>();
	for (const [questionIndex, question] of questions.entries()) {
		validateQuestion(question, questionIndex, questionIds, issues);
	}
}

function validateQuestion(
	question: AskQuestionInput,
	questionIndex: number,
	questionIds: Set<string>,
	issues: AskValidationIssue[]
): void {
	const questionNumber = questionIndex + 1;
	const questionPath = `questions[${questionIndex}]`;
	const questionId = question.id?.trim();
	const questionType = normalizeQuestionType(question.type);
	assertValidQuestionType(
		question.type,
		`Question ${questionNumber}: invalid type ${JSON.stringify(question.type)}; expected "single", "multi", or "preview"`,
		issues,
		`${questionPath}.type`
	);

	assertNonEmpty(
		questionId,
		`Question ${questionNumber}: id is required`,
		issues,
		`${questionPath}.id`
	);
	assertUnique(
		questionIds,
		questionId,
		`Question ${questionNumber}: duplicate question id "${questionId}"`,
		issues,
		`${questionPath}.id`
	);
	assertOptionalNonEmpty(
		question.label,
		`Question ${questionNumber}: label must not be empty`,
		issues,
		`${questionPath}.label`
	);
	assertNonEmpty(
		question.prompt?.trim(),
		`Question ${questionNumber}: prompt is required`,
		issues,
		`${questionPath}.prompt`
	);
	assertHasItems(
		question.options,
		`Question ${questionNumber}: at least one option is required`,
		issues,
		`${questionPath}.options`
	);

	const optionValues = new Set<string>();
	for (const [optionIndex, option] of question.options.entries()) {
		validateOption(
			option,
			optionIndex,
			optionValues,
			questionNumber,
			questionType,
			issues,
			`${questionPath}.options[${optionIndex}]`
		);
	}
}

function validateOption(
	option: AskOption,
	optionIndex: number,
	optionValues: Set<string>,
	questionNumber: number,
	questionType: AskQuestion["type"],
	issues: AskValidationIssue[],
	optionPath: string
): void {
	const optionNumber = optionIndex + 1;
	const prefix = `Question ${questionNumber}, option ${optionNumber}`;
	const optionValue = option.value?.trim();

	assertNonEmpty(
		optionValue,
		`${prefix}: value is required`,
		issues,
		`${optionPath}.value`
	);
	assertUnique(
		optionValues,
		optionValue,
		`${prefix}: duplicate option value "${optionValue}"`,
		issues,
		`${optionPath}.value`
	);
	assertNonEmpty(
		option.label?.trim(),
		`${prefix}: label is required`,
		issues,
		`${optionPath}.label`
	);
	assertOptionalNonEmpty(
		option.description,
		`${prefix}: description must not be empty`,
		issues,
		`${optionPath}.description`
	);
	assertOptionalNonEmpty(
		option.preview,
		`${prefix}: preview must not be empty`,
		issues,
		`${optionPath}.preview`
	);
	if (questionType === "preview") {
		assertNonEmpty(
			option.preview?.trim(),
			`${prefix}: preview questions require preview text for every option; add preview text or use type "single" instead`,
			issues,
			`${optionPath}.preview`
		);
	}
}

function normalizeQuestionType(
	value: AskQuestionInput["type"]
): AskQuestion["type"] {
	return value === "multi" || value === "preview" ? value : "single";
}

function assertValidQuestionType(
	value: AskQuestionInput["type"],
	errorMessage: string,
	issues: AskValidationIssue[],
	path: string
): void {
	if (
		value !== undefined &&
		value !== "single" &&
		value !== "multi" &&
		value !== "preview"
	) {
		issues.push({ path, message: errorMessage });
	}
}

function assertHasItems(
	items: unknown[],
	errorMessage: string,
	issues: AskValidationIssue[],
	path: string
): void {
	if (items.length === 0) {
		issues.push({ path, message: errorMessage });
	}
}

function assertNonEmpty(
	value: string | undefined,
	errorMessage: string,
	issues: AskValidationIssue[],
	path: string
): void {
	if (!value) {
		issues.push({ path, message: errorMessage });
	}
}

function assertOptionalNonEmpty(
	value: string | undefined,
	errorMessage: string,
	issues: AskValidationIssue[],
	path: string
): void {
	if (value !== undefined && !value.trim()) {
		issues.push({ path, message: errorMessage });
	}
}

function assertUnique(
	seen: Set<string>,
	value: string | undefined,
	errorMessage: string,
	issues: AskValidationIssue[],
	path: string
): void {
	if (!value) {
		return;
	}
	if (seen.has(value)) {
		issues.push({ path, message: errorMessage });
		return;
	}
	seen.add(value);
}
