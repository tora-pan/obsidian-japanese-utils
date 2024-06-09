import { Editor, EditorPosition } from "obsidian";

export const insertLetter = (
	editor: Editor,
	letter: string,
	position: EditorPosition
) => {
	editor.replaceRange(letter, position);
};

export const insertBlockWithDelay = (
	editor: Editor,
	block: string,
	position: EditorPosition,
	delay: number
) => {
	block.split("").forEach((letter, j) => {
		setTimeout(() => {
			insertLetter(editor, letter, position);
			position.ch++; // Move the cursor to the right after each letter
		}, delay + j * 100); // Increment the delay for each letter
	});
};

export const getBlocks = (editor: Editor) => {
	const allText = editor.getValue();
	console.log("allText: ", allText);
	editor.setValue("");
	return allText.split(/\n\s*\n/).map((block) => block.trim() + "\n"); // Add '\n' back to preserve structure
};
