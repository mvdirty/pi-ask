import { visibleWidth } from "@mariozechner/pi-tui";

export function wrapText(text: string, width: number): string[] {
	const effectiveWidth = Math.max(1, width);
	const lines: string[] = [];
	const paragraphs = text.split("\n");

	for (const paragraph of paragraphs) {
		if (paragraph.length === 0) {
			lines.push("");
			continue;
		}

		const leadingWhitespace = paragraph.match(/^\s*/)?.[0] ?? "";
		const body = paragraph.slice(leadingWhitespace.length).trim();
		if (!body) {
			lines.push(leadingWhitespace);
			continue;
		}

		const wrapped = wrapParagraph(
			body,
			effectiveWidth - visibleWidth(leadingWhitespace),
		);
		if (wrapped.length === 0) {
			lines.push(leadingWhitespace);
			continue;
		}

		for (const [index, part] of wrapped.entries()) {
			lines.push(
				index === 0
					? `${leadingWhitespace}${part}`
					: `${leadingWhitespace}${part}`,
			);
		}
	}

	return lines.length > 0 ? lines : [""];
}

function wrapParagraph(text: string, width: number): string[] {
	const effectiveWidth = Math.max(1, width);
	const words = text.split(/\s+/).filter(Boolean);
	const lines: string[] = [];
	let current = "";

	for (const word of words) {
		if (!current) {
			if (visibleWidth(word) <= effectiveWidth) {
				current = word;
			} else {
				lines.push(...breakLongWord(word, effectiveWidth));
			}
			continue;
		}

		const candidate = `${current} ${word}`;
		if (visibleWidth(candidate) <= effectiveWidth) {
			current = candidate;
			continue;
		}

		lines.push(current);
		if (visibleWidth(word) <= effectiveWidth) {
			current = word;
		} else {
			lines.push(...breakLongWord(word, effectiveWidth));
			current = "";
		}
	}

	if (current) {
		lines.push(current);
	}

	return lines;
}

function breakLongWord(word: string, width: number): string[] {
	const effectiveWidth = Math.max(1, width);
	const chunks: string[] = [];
	let current = "";

	for (const char of Array.from(word)) {
		const candidate = `${current}${char}`;
		if (visibleWidth(candidate) > effectiveWidth && current) {
			chunks.push(current);
			current = char;
			continue;
		}
		current = candidate;
	}

	if (current) {
		chunks.push(current);
	}

	return chunks;
}
