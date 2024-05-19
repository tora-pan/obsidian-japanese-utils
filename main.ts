import { get } from "http";
import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: "default",
};

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

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
		this.registerDomEvent(document, "click", (evt: MouseEvent) => {
			console.log("click", evt);
		});
		function getTextNodes(element) {
			const textNodes = [];
			function traverse(node) {
				node.childNodes.forEach((child) => {
					if (child.nodeType === Node.TEXT_NODE) {
						textNodes.push(child);
					} else if (child.nodeType === Node.ELEMENT_NODE) {
						traverse(child);
					}
				});
			}
			traverse(element);
			return textNodes;
		}

		

		function isCursorInRect(x, y, rect) {
			return (
				x >= rect.left &&
				x <= rect.right &&
				y >= rect.top &&
				y <= rect.bottom
			);
		}

		function getWordUnderCursor(textNode, x, y) {
			const text = textNode.textContent;
			console.log(textNode)
			const range = document.createRange();
			for (let i = 0; i < text.length; i++) {
				range.setStart(textNode, i);
				range.setEnd(textNode, i + 1);
				const rects = range.getClientRects();
				for (let j = 0; j < rects.length; j++) {
					const rect = rects[j];
					if (isCursorInRect(x, y, rect)) {
						return text
							.split(/\s+/)
							.find((word) => word.includes(text[i]));
					}
				}
			}
			return null;
		}

		function highlightWord(textNode, word) {
			const text = textNode.textContent;
			const index = text.indexOf(word);
			const range = document.createRange();
			range.setStart(textNode, index);
			range.setEnd(textNode, index + word.length);
			const span = document.createElement("span");
			span.className = "highlight";
			range.surroundContents(span);
		}

		const listOfTags = [
			"DIV",
			"SPAN",
			"P",
			"H1",
			"H2",
			"H3",
			"H4",
			"H5",
			"H6",
		];

		const rectElement = document.createElement("div");
		rectElement.style.position = "absolute";
		rectElement.style.border = "1px solid red";
		rectElement.style.pointerEvents = "none";
		rectElement.style.zIndex = "1000";
		if(!document.body.contains(rectElement)){
			document.body.appendChild(rectElement);
		}


		this.registerDomEvent(document, "pointermove", (evt: PointerEvent) => {
			let element = document.elementFromPoint(evt.clientX, evt.clientY);
			
			// if the element has an any children, drill down until you get to the text node
			if (!element)return; 

			if (element.nodeType === Node.TEXT_NODE) {
				element = element.parentElement;
			}

			if (element.nodeType === Node.ELEMENT_NODE) {
				const textNodes = getTextNodes(element);
				textNodes.forEach((node) => {
					const range = document.createRange();
					range.selectNodeContents(node);
					const rects = range.getClientRects();
					for (let i = 0; i < rects.length; i++) {
						const rect = rects[i];
						if (
							isCursorInRect(event.clientX, event.clientY, rect)
						) {
							rectElement.style.display = "block";
							rectElement.style.left = rect.left + "px";
							rectElement.style.top = rect.top + "px";
							rectElement.style.width = rect.width + "px";
							rectElement.style.height = rect.height + "px";
							const word = getWordUnderCursor(
								node,
								event.clientX,
								event.clientY
							);
							if (word) {
								console.log(word);
								highlightWord(node, word);
							}
							return;
						}else{
								rectElement.style.display = "none";
							}
					}
				});
			}else{
				console.log("Element is not a text node");
			}
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		);
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
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
			.setName("Setting #1")
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.mySetting)
					.onChange(async (value) => {
						this.plugin.settings.mySetting = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
