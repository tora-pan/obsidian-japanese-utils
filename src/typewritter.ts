import { Editor, EditorPosition } from "obsidian";

// Helper function to insert a letter at a specific position
export const insertLetter = (editor: Editor, letter: string, position: EditorPosition) => {
    editor.replaceRange(letter, position);
    position.ch++; // Move the cursor to the right after each letter
    editor.setCursor(position);
};

// Helper function to create a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Function to insert a block with random delays between each letter
export const insertBlockWithDelay = async (editor: Editor, block: string, position: EditorPosition) => {
    for (const letter of block) {
        insertLetter(editor, letter, position);
        const randomDelay = Math.random() * 200 + 10; // Random delay between 50ms and 250ms
        await delay(randomDelay);
    }
};

// Function to get blocks of text from the editor
export const getBlocks = (editor: Editor) => {
    const allText = editor.getValue();
    console.log("allText: ", allText);
    editor.setValue("");
    return allText.split(/\n\s*\n/).map((block) => block.trim() + "\n"); // Add '\n' back to preserve structure
};
