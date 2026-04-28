import {
	ASK_KEY_BINDINGS,
	matchesBinding,
	matchesDigitShortcut,
} from "../constants/keymaps.ts";
import type { AskState } from "../types.ts";

export type AskInputCommand =
	| { kind: "moveTab"; delta: 1 | -1 }
	| { kind: "moveOption"; delta: 1 | -1 }
	| { kind: "toggleMulti" }
	| { kind: "openQuestionNote" }
	| { kind: "openOptionNote" }
	| { kind: "confirm" }
	| { kind: "cancel" }
	| { kind: "dismiss" }
	| { kind: "showHelp" }
	| { kind: "numberShortcut"; digit: number }
	| { kind: "editMoveTab"; delta: 1 | -1 }
	| { kind: "editMoveOption"; delta: 1 | -1 }
	| { kind: "editClose" }
	| { kind: "delegateToEditor" }
	| { kind: "ignore" };

export function getInputCommand(
	state: AskState,
	data: string,
	editingText = ""
): AskInputCommand {
	if (matchesBinding(data, ASK_KEY_BINDINGS.dismiss)) {
		return { kind: "dismiss" };
	}
	if (matchesBinding(data, ASK_KEY_BINDINGS.help) && editingText.length === 0) {
		return { kind: "showHelp" };
	}

	if (state.view.kind === "input" || state.view.kind === "note") {
		return getEditingInputCommand(data, editingText);
	}

	return getNavigationInputCommand(data);
}

export function formatKeybindingLabel(key: string): string {
	return key
		.split("+")
		.map((part) => {
			if (part.length <= 1) {
				return part.toUpperCase();
			}
			return part.charAt(0).toUpperCase() + part.slice(1);
		})
		.join("+");
}

function getEditingInputCommand(
	data: string,
	editingText: string
): AskInputCommand {
	if (matchesBinding(data, ASK_KEY_BINDINGS.cancel)) {
		return { kind: "editClose" };
	}
	if (editingText.length === 0) {
		if (matchesBinding(data, ASK_KEY_BINDINGS.nextTab)) {
			return { kind: "editMoveTab", delta: 1 };
		}
		if (matchesBinding(data, ASK_KEY_BINDINGS.previousTab)) {
			return { kind: "editMoveTab", delta: -1 };
		}
		if (matchesBinding(data, ASK_KEY_BINDINGS.previousOption)) {
			return { kind: "editMoveOption", delta: -1 };
		}
		if (matchesBinding(data, ASK_KEY_BINDINGS.nextOption)) {
			return { kind: "editMoveOption", delta: 1 };
		}
	}
	return { kind: "delegateToEditor" };
}

function getNavigationInputCommand(data: string): AskInputCommand {
	if (matchesBinding(data, ASK_KEY_BINDINGS.nextTab)) {
		return { kind: "moveTab", delta: 1 };
	}
	if (matchesBinding(data, ASK_KEY_BINDINGS.previousTab)) {
		return { kind: "moveTab", delta: -1 };
	}
	if (matchesBinding(data, ASK_KEY_BINDINGS.previousOption)) {
		return { kind: "moveOption", delta: -1 };
	}
	if (matchesBinding(data, ASK_KEY_BINDINGS.nextOption)) {
		return { kind: "moveOption", delta: 1 };
	}
	if (matchesBinding(data, ASK_KEY_BINDINGS.toggle)) {
		return { kind: "toggleMulti" };
	}
	if (matchesBinding(data, ASK_KEY_BINDINGS.confirm)) {
		return { kind: "confirm" };
	}
	if (matchesBinding(data, ASK_KEY_BINDINGS.cancel)) {
		return { kind: "cancel" };
	}
	if (matchesBinding(data, ASK_KEY_BINDINGS.questionNote)) {
		return { kind: "openQuestionNote" };
	}
	if (matchesBinding(data, ASK_KEY_BINDINGS.optionNote)) {
		return { kind: "openOptionNote" };
	}

	const digit = matchesDigitShortcut(data);
	return digit === null
		? { kind: "ignore" }
		: { kind: "numberShortcut", digit };
}
