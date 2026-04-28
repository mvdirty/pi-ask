import { Key, matchesKey } from "@mariozechner/pi-tui";

const DIGIT_SHORTCUT_PATTERN = /^[1-9]$/;

type KeyId = Parameters<typeof matchesKey>[1];
type InputKey = KeyId | (string & {});

export type AskKeyBindingKind = "command" | "affordance";

export interface AskKeyBinding {
	contexts: readonly string[];
	description: string;
	id: string;
	keys: readonly InputKey[];
	kind: AskKeyBindingKind;
	label: string;
}

export type FooterKeymapContext =
	| "default"
	| "multi"
	| "submit"
	| "input"
	| "note";

export const ASK_KEY_BINDINGS = {
	help: {
		id: "help",
		keys: ["?"],
		kind: "command",
		label: "?",
		description: "Show this menu",
		contexts: ["Main flow"],
	},
	cancel: {
		id: "cancel",
		keys: [Key.escape],
		kind: "command",
		label: "Esc",
		description: "Cancel flow or close/save editor draft",
		contexts: ["Main flow", "Editors"],
	},
	dismiss: {
		id: "dismiss",
		keys: [Key.ctrl("c")],
		kind: "command",
		label: "Ctrl+C",
		description: "Dismiss entire ask flow immediately",
		contexts: ["Anywhere"],
	},
	nextTab: {
		id: "nextTab",
		keys: [Key.tab, Key.right],
		kind: "command",
		label: "Tab / →",
		description: "Switch to next tab",
		contexts: ["Main flow", "Empty editor"],
	},
	previousTab: {
		id: "previousTab",
		keys: [Key.shift("tab"), Key.left],
		kind: "command",
		label: "Shift+Tab / ←",
		description: "Switch to previous tab",
		contexts: ["Main flow", "Empty editor"],
	},
	previousOption: {
		id: "previousOption",
		keys: [Key.up],
		kind: "command",
		label: "↑ / ↓",
		description: "Move between options/actions",
		contexts: ["Main flow", "Empty editor"],
	},
	nextOption: {
		id: "nextOption",
		keys: [Key.down],
		kind: "command",
		label: "↓",
		description: "Move to next option/action",
		contexts: ["Main flow", "Empty editor"],
	},
	numberShortcut: {
		id: "numberShortcut",
		keys: ["1..9"],
		kind: "command",
		label: "1..9",
		description: "Quick-select option or submit action",
		contexts: ["Main flow", "Submit tab"],
	},
	toggle: {
		id: "toggle",
		keys: [Key.space],
		kind: "command",
		label: "Space",
		description: "Toggle selected option",
		contexts: ["Multi-select questions"],
	},
	confirm: {
		id: "confirm",
		keys: [Key.enter],
		kind: "command",
		label: "Enter",
		description: "Confirm selection, continue, save, or submit",
		contexts: ["Main flow", "Editors"],
	},
	optionNote: {
		id: "optionNote",
		keys: ["n"],
		kind: "command",
		label: "N",
		description: "Edit selected option note",
		contexts: ["Question tabs"],
	},
	questionNote: {
		id: "questionNote",
		keys: ["N"],
		kind: "command",
		label: "Shift+N",
		description: "Edit question note",
		contexts: ["Question tabs"],
	},
	fileReference: {
		id: "fileReference",
		keys: ["@"],
		kind: "affordance",
		label: "@",
		description: "Reference files while typing answers or notes",
		contexts: ["Editors"],
	},
} as const satisfies Record<string, AskKeyBinding>;

export const ASK_KEYMAPS: readonly AskKeyBinding[] = [
	ASK_KEY_BINDINGS.help,
	ASK_KEY_BINDINGS.cancel,
	ASK_KEY_BINDINGS.dismiss,
	ASK_KEY_BINDINGS.nextTab,
	ASK_KEY_BINDINGS.previousTab,
	ASK_KEY_BINDINGS.previousOption,
	ASK_KEY_BINDINGS.numberShortcut,
	ASK_KEY_BINDINGS.toggle,
	ASK_KEY_BINDINGS.confirm,
	ASK_KEY_BINDINGS.optionNote,
	ASK_KEY_BINDINGS.questionNote,
	ASK_KEY_BINDINGS.fileReference,
] as const;

const footerHint = (
	binding: AskKeyBinding,
	action: string,
	label = binding.label
): string => `${label} ${action}`;
const optionNavigationLabel = ASK_KEY_BINDINGS.previousOption.label.replaceAll(
	" / ",
	""
);
const tabNavigationLabel = "⇆";
const noteNavigationLabel = `${ASK_KEY_BINDINGS.optionNote.label}/${ASK_KEY_BINDINGS.questionNote.label}`;

export const ASK_FOOTER_HINTS_BY_CONTEXT: Record<
	FooterKeymapContext,
	readonly string[]
> = {
	input: [
		footerHint(ASK_KEY_BINDINGS.confirm, "submit"),
		footerHint(ASK_KEY_BINDINGS.cancel, "close"),
		footerHint(ASK_KEY_BINDINGS.help, "help"),
	],
	note: [
		footerHint(ASK_KEY_BINDINGS.confirm, "save"),
		footerHint(ASK_KEY_BINDINGS.cancel, "close"),
		footerHint(ASK_KEY_BINDINGS.help, "help"),
	],
	submit: [
		footerHint(ASK_KEY_BINDINGS.numberShortcut, "hotkeys"),
		footerHint(
			ASK_KEY_BINDINGS.previousOption,
			"select",
			optionNavigationLabel
		),
		footerHint(ASK_KEY_BINDINGS.confirm, "confirm"),
		footerHint(ASK_KEY_BINDINGS.cancel, "cancel"),
		footerHint(ASK_KEY_BINDINGS.help, "help"),
	],
	multi: [
		footerHint(ASK_KEY_BINDINGS.nextTab, "tab", tabNavigationLabel),
		footerHint(
			ASK_KEY_BINDINGS.previousOption,
			"select",
			optionNavigationLabel
		),
		footerHint(ASK_KEY_BINDINGS.toggle, "toggle"),
		footerHint(ASK_KEY_BINDINGS.confirm, "continue"),
		footerHint(ASK_KEY_BINDINGS.optionNote, "note", noteNavigationLabel),
		footerHint(ASK_KEY_BINDINGS.cancel, "dismiss"),
		footerHint(ASK_KEY_BINDINGS.help, "help"),
	],
	default: [
		footerHint(ASK_KEY_BINDINGS.nextTab, "tab", tabNavigationLabel),
		footerHint(
			ASK_KEY_BINDINGS.previousOption,
			"select",
			optionNavigationLabel
		),
		footerHint(ASK_KEY_BINDINGS.confirm, "confirm"),
		footerHint(ASK_KEY_BINDINGS.optionNote, "note", noteNavigationLabel),
		footerHint(ASK_KEY_BINDINGS.cancel, "dismiss"),
		footerHint(ASK_KEY_BINDINGS.help, "help"),
	],
} as const;

export const ASK_HELP_CLOSE_BINDINGS = [
	ASK_KEY_BINDINGS.cancel,
	ASK_KEY_BINDINGS.dismiss,
	ASK_KEY_BINDINGS.help,
] as const;

export const ASK_HELP_CLOSE_HINT = `Press ${ASK_HELP_CLOSE_BINDINGS.map(
	(binding) => binding.label
)
	.map((label, index, labels) => {
		if (index === 0) {
			return label;
		}
		if (index === labels.length - 1) {
			return `or ${label}`;
		}
		return label;
	})
	.join(", ")} to close.`;

export function renderFooterKeymaps(context: FooterKeymapContext): string {
	return ` ${ASK_FOOTER_HINTS_BY_CONTEXT[context].join(" · ")}`;
}

export function matchesBinding(data: string, binding: AskKeyBinding): boolean {
	return binding.keys.some((key) => {
		if (key.length === 1) {
			return data === key;
		}
		return matchesKey(data, key as KeyId);
	});
}

export function matchesDigitShortcut(data: string): number | null {
	return DIGIT_SHORTCUT_PATTERN.test(data) ? Number(data) : null;
}
