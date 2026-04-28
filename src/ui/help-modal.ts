import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";
import {
	ASK_HELP_CLOSE_BINDINGS,
	ASK_HELP_CLOSE_HINT,
	ASK_KEYMAPS,
	matchesBinding,
} from "../constants/keymaps.ts";
import { wrapText } from "../text.ts";

interface Theme {
	bg(color: string, text: string): string;
	fg(color: string, text: string): string;
}

const MIN_WIDTH = 24;
const COMPACT_WIDTH = 46;

function padToWidth(text: string, width: number): string {
	return text + " ".repeat(Math.max(0, width - visibleWidth(text)));
}

export class AskHelpModal {
	private closed = false;
	private readonly onClose: () => void;
	private readonly theme: Theme;

	constructor(theme: Theme, onClose: () => void) {
		this.theme = theme;
		this.onClose = onClose;
	}

	handleInput(data: string): void {
		if (
			ASK_HELP_CLOSE_BINDINGS.some((binding) => matchesBinding(data, binding))
		) {
			this.close();
		}
	}

	render(width: number): string[] {
		const innerW = Math.max(MIN_WIDTH, width - 2);
		const compact = innerW < COMPACT_WIDTH;
		const keyW = compact ? 11 : 16;
		const descW = Math.max(8, innerW - keyW - 5);
		const border = (text: string) => this.theme.fg("border", text);
		const title = this.theme.fg("accent", " @eko24ive/pi-ask ");
		const titleW = visibleWidth(title);
		const titlePad = Math.max(0, innerW - titleW);
		const left = Math.floor(titlePad / 2);
		const right = titlePad - left;
		const line = (content = "") =>
			`${border("│")}${padToWidth(` ${content}`, innerW)}${border("│")}`;

		const lines = [
			`${border(`╭${"─".repeat(left)}`)}${title}${border(`${"─".repeat(right)}╮`)}`,
			`${border(`├${"─".repeat(innerW)}┤`)}`,
		];

		for (const hint of ASK_KEYMAPS) {
			if (compact) {
				lines.push(line(this.theme.fg("accent", hint.label)));
				for (const descLine of wrapText(hint.description, innerW - 3)) {
					lines.push(line(`  ${this.theme.fg("text", descLine)}`));
				}
				continue;
			}

			const keyText = padToWidth(truncateToWidth(hint.label, keyW, "…"), keyW);
			const key = this.theme.fg("accent", keyText);
			const desc = truncateToWidth(hint.description, descW, "…");
			lines.push(line(`${key} ${desc}`));
			const contexts = hint.contexts.join(", ");
			lines.push(
				line(`${" ".repeat(keyW)}  ${this.theme.fg("dim", contexts)}`)
			);
		}

		lines.push(`${border(`├${"─".repeat(innerW)}┤`)}`);
		for (const hintLine of wrapText(ASK_HELP_CLOSE_HINT, innerW - 2)) {
			lines.push(line(this.theme.fg("muted", hintLine)));
		}
		lines.push(`${border(`╰${"─".repeat(innerW)}╯`)}`);
		return lines;
	}

	invalidate(): void {
		// Static modal; no async invalidation needed.
	}

	dispose(): void {
		this.close();
	}

	private close(): void {
		if (this.closed) {
			return;
		}
		this.closed = true;
		this.onClose();
	}
}
