import { Editor, EditorPosition } from "obsidian";

// Helper function to insert a letter at a specific position
export const insertLetter = async (editor: Editor, letter: string, position: EditorPosition) => {
    editor.replaceRange(letter, position);
    position.ch++; // Move the cursor to the right after each letter
    editor.setCursor(position);
};

// Helper function to create a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Function to insert a block with random delays between each letter
export const insertBlockWithDelay = async (editor: Editor, block: string, position: EditorPosition) => {
    const pattern = /=h=(.*?)=h=/g;
    let lastIndex = 0;
    let match;

    // Use while loop to handle each segment around the delimiters
    while ((match = pattern.exec(block)) !== null) {
        // Insert text before the match letter by letter
        const textBefore = block.substring(lastIndex, match.index);
        for (const letter of textBefore) {
            await insertLetter(editor, letter, position);
            const randomDelay = Math.random() * 200 + 10; // Random delay between 10ms and 210ms
            await delay(randomDelay);
        }

        // Insert the whole matched block at once
        const matchedText = match[0];
        editor.replaceRange(matchedText, position);
        position.ch += matchedText.length; // Move the cursor to the end of the inserted block
        editor.setCursor(position);

        // Update lastIndex to the end of the current match
        lastIndex = pattern.lastIndex;
    }

    // Insert any remaining text after the last match letter by letter
    const remainingText = block.substring(lastIndex);
    for (const letter of remainingText) {
        await insertLetter(editor, letter, position);
        const randomDelay = Math.random() * 30 + 10; // Random delay between 10ms and 210ms
        await delay(randomDelay);
    }
};

// Function to get blocks of text from the editor
export const getBlocks = (editor: Editor) => {
    const allText = editor.getValue();
    editor.setValue("");
    const split = allText.split(/\n\s*\n/);
    return split.map((block) => block + "\n");
};
