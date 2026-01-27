import {Plugin} from 'obsidian';
import {DEFAULT_SETTINGS, ImageViewSettings, ImageViewSettingTab} from "./settings";
import {ImageSlideshowView, VIEW_TYPE_IMAGE_SLIDESHOW} from "./ImageSlideshowView";

export default class ImageViewPlugin extends Plugin {
	settings: ImageViewSettings;

	async onload() {
		await this.loadSettings();

		// Register the custom view
		this.registerView(
			VIEW_TYPE_IMAGE_SLIDESHOW,
			(leaf) => new ImageSlideshowView(leaf, this)
		);

		// Add ribbon icon to open the slideshow view
		this.addRibbonIcon('images', 'Open image slideshow', () => {
			this.activateView().catch(err => console.error('Failed to activate view', err));
		});

		// Add command to open the image slideshow view
		this.addCommand({
			id: 'imageview-open-slideshow',
			name: 'Open image slideshow',
			callback: () => {
				this.activateView().catch(err => console.error('Failed to activate view', err));
			}
		});

		// Add settings tab
		this.addSettingTab(new ImageViewSettingTab(this.app, this));

	}

	async activateView() {
		const { workspace } = this.app;

		// Check if view already exists
		let leaf = workspace.getLeavesOfType(VIEW_TYPE_IMAGE_SLIDESHOW)[0];

		if (!leaf) {
			// Create new leaf in right sidebar
			const rightLeaf = workspace.getRightLeaf(false);
			if (rightLeaf) {
				await rightLeaf.setViewState({
					type: VIEW_TYPE_IMAGE_SLIDESHOW,
					active: true,
				});
				leaf = rightLeaf;
			}
			// Reveal the leaf
			if (leaf) {
				await workspace.revealLeaf(leaf);
			}
		} else {
			// If view already exists, close it (toggle behavior)
			leaf.detach();
		}
	}

	onunload() {
	}

	async loadSettings() {
		const saved = (await this.loadData()) as Partial<ImageViewSettings> | null;

		this.settings = Object.assign({}, DEFAULT_SETTINGS, saved ?? {});
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
