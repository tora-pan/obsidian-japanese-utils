import { Editor, EditorPosition } from "obsidian";

export const insertLetter = async (editor: Editor, letter: string, position: EditorPosition) => {
    editor.replaceRange(letter, position);
    position.ch++; // Move the cursor to the right after each letter
    editor.setCursor(position);
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const insertBlockWithDelay = async (editor: Editor, block: string, position: EditorPosition) => {
    const pattern = /=h=(.*?)=h=/g;
    let lastIndex = 0;
    let match;

    while ((match = pattern.exec(block)) !== null) {
        const textBefore = block.substring(lastIndex, match.index);
        for (const letter of textBefore) {
            await insertLetter(editor, letter, position);
            const randomDelay = Math.random() * 200 + 10; 
            await delay(randomDelay);
        }

        // Insert the whole matched block at once
        const matchedText = match[0];
        editor.replaceRange(matchedText, position);
        position.ch += matchedText.length; 
        editor.setCursor(position);

        lastIndex = pattern.lastIndex;
    }

    const remainingText = block.substring(lastIndex);
    for (const letter of remainingText) {
        await insertLetter(editor, letter, position);
        const randomDelay = Math.random() * 30 + 10; 
        await delay(randomDelay);
    }
};

export const getBlocks = (editor: Editor) => {
    const allText = editor.getValue();
    editor.setValue("");
    const split = allText.split(/\n\s*\n/);
    return split.map((block) => block + "\n");
};
