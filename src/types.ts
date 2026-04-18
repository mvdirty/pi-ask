export type AskQuestionType = "single" | "multi" | "preview";

export interface AskOption {
	description?: string;
	label: string;
	preview?: string;
	value: string;
}

export interface AskQuestionInput {
	id: string;
	label?: string;
	options: AskOption[];
	prompt: string;
	required?: boolean;
	type?: AskQuestionType;
}

export interface AskParams {
	questions: AskQuestionInput[];
	title?: string;
}

export interface AskQuestion
	extends Omit<AskQuestionInput, "type" | "required" | "label"> {
	label: string;
	required: boolean;
	type: AskQuestionType;
}

export interface AskSelectedOption {
	index: number;
	label: string;
	value: string;
}

export interface AskStateAnswer {
	customText?: string;
	note?: string;
	optionNotes?: Record<string, string>;
	selected: AskSelectedOption[];
}

export interface AskResultAnswer {
	customText?: string;
	indices: number[];
	labels: string[];
	note?: string;
	optionNotes?: Record<string, string>;
	values: string[];
}

export interface AskResult {
	answers: Record<string, AskResultAnswer>;
	cancelled: boolean;
	questions: Array<{
		id: string;
		label: string;
		prompt: string;
		type: AskQuestionType;
	}>;
	title?: string;
}

export type ViewState =
	| { kind: "navigate" }
	| { kind: "submit" }
	| { kind: "input"; questionId: string }
	| { kind: "note"; questionId: string; optionValue?: string };

export interface AskState {
	activeOptionIndex: number;
	activeSubmitActionIndex: number;
	activeTabIndex: number;
	answers: Record<string, AskStateAnswer>;
	cancelled: boolean;
	completed: boolean;
	questions: AskQuestion[];
	title?: string;
	view: ViewState;
}

export interface AskDisplayOption extends AskOption {
	isCustomOption?: boolean;
}

export type AskAction =
	| { type: "MOVE_TAB"; delta: 1 | -1 }
	| { type: "MOVE_OPTION"; delta: 1 | -1 }
	| { type: "OPEN_INPUT"; questionId: string }
	| { type: "OPEN_QUESTION_NOTE"; questionId: string }
	| { type: "OPEN_OPTION_NOTE"; questionId: string; optionValue: string }
	| { type: "CONFIRM" }
	| { type: "TOGGLE_MULTI" }
	| { type: "NUMBER_SHORTCUT"; digit: number }
	| { type: "SAVE_INPUT"; value: string; submit?: boolean }
	| { type: "SAVE_NOTE"; value: string }
	| { type: "CANCEL" };
