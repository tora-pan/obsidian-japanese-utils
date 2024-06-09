import {
	App,
	Editor,
	EditorPosition,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";

interface TypewriterSettings {
	blockDelimiter: string;
	typingSpeed: string;
}

export default class MyPlugin extends Plugin {
	settings: TypewriterSettings;

	async onload() {
		await this.loadSettings();

		

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"dice",
			"Sample Plugin",
			(evt: MouseEvent) => {
				// Called when the user clicks the icon.
				new Notice("This is a notice!");
			}
		);
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("Status Bar Text");

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "open-sample-modal-simple",
			name: "Open sample modal (simple)",
			callback: () => {
				new SampleModal(this.app).open();
			},
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: "sample-editor-command",
			name: "Sample editor command",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection("Sample Editor Command");
			},
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: "open-sample-modal-complex",
			name: "Open sample modal (complex)",
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, "click", async (evt: MouseEvent) => {
			console.log(this.settings);
		});

		const insertLetter = (editor: Editor, letter: string, position: EditorPosition) => {
			editor.replaceRange(letter, position);
		};

		const insertBlockWithDelay = (editor:Editor, block:string, position:EditorPosition, delay:number) => {
			block.split("").forEach((letter, j) => {
				setTimeout(() => {
					insertLetter(editor, letter, position);
					position.ch++; // Move the cursor to the right after each letter
				}, delay + j * 100); // Increment the delay for each letter
			});
		};

		const getBlocks = (editor:Editor) => {
			const allText = editor.getValue();
			console.log("allText: ", allText);
			editor.setValue('');
			return allText.split(/\n\s*\n/).map((block) => block.trim() + "\n"); // Add '\n' back to preserve structure
		};


		this.addCommand({
			id: "start-typewriter",
			name: "Start Typewriter",
			editorCallback: (editor) => {
				const blocks = getBlocks(editor);
				let delay = 0;
				let currentPos = editor.getCursor();

				blocks.forEach((block, index) => {
					insertBlockWithDelay(editor, block, currentPos, delay);
					currentPos = editor.getCursor();
					currentPos.line += block.split("\n").length; // Move the cursor to the end of the inserted block
					currentPos.ch = 0; // Move cursor to the beginning of the next line
					delay += block.length * 100; // Increment the delay for each block
				});
				editor.setCursor(currentPos);
			},
		});

		this.registerDomEvent(
			document,
			"pointermove",
			(evt: PointerEvent) => {}
		);

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		// this.registerInterval(
		// );

	// 	this.registerMarkdownPostProcessor((element, context) => {
	// 		// Find all text blocks wrapped in -=-
	// 		element.querySelectorAll("p").forEach((p) => {
	// 			const regex = /-=-([\s\S]*?)-=-/g;
	// 			p.innerHTML = p.innerHTML.replace(regex, (match, p1) => {
	// 				// Apply your custom processing here
	// 				console.log('here')
	// 				return `${p1}`;
	// 			});
	// 		});
	// 		this.app.commands.executeCommandById("start-typewriter");
	// 	});
	// }
	// addCustomStyles() {
	// 	const style = document.createElement("style");
	// 	style.textContent = `
	// 		.custom-syntax {
	// 			font-weight: bold;
	// 			color: blue;
	// 			}
	// 			`;
	// 	document.head.appendChild(style);

	// 	this.addCustomStyles();
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign({}, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText("Woah!");
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
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
