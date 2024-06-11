import {
	App,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";
import { getBlocks, insertBlockWithDelay } from "./typewritter";

interface TypewriterSettings {
	blockDelimiter: string;
	typingSpeed: string;
}

export default class MyPlugin extends Plugin {
	settings: TypewriterSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new TypingUtilsSettingsTab(this.app, this));

		this.registerDomEvent(document, "keypress", (evt: KeyboardEvent) => {
			// console.log(evt);
		});
		
		this.addCommand({
    id: "start-typewriter",
    name: "Start Typewriter",
    editorCallback: async (editor) => {
        const blocks = getBlocks(editor);
        let currentPos = editor.getCursor();
        for (let block of blocks) {
            // const delay = Math.floor(Math.random() * 1000) + 1000;
						block += "\n";
            await insertBlockWithDelay(editor, block, currentPos);
            currentPos = editor.getCursor();
            currentPos.line += block.split("\n").length; // Move the cursor to the end of the inserted block
            currentPos.ch = 0; // Move cursor to the beginning of the next line
        }
        editor.setCursor(currentPos);
    },
});
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign({}, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class TypingUtilsSettingsTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Delimiter")
			.setDesc(
				"The character(s) that will be used to separate blocks of text."
			)
			.addText((text) =>
				text
					.setPlaceholder("Enter a delimiter")
					.setValue(this.plugin.settings.blockDelimiter)
					.onChange(async (value) => {
						this.plugin.settings.blockDelimiter = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Typing Speed")
			.setDesc("The speed at which the text will be typed out.")
			.addText((text) =>
				text
					.setPlaceholder("Enter a speed")
					.setValue(this.plugin.settings.typingSpeed)
					.onChange(async (value) => {
						this.plugin.settings.typingSpeed = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
