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
		this.addRibbonIcon('images', 'Open Image Slideshow', () => {
			this.activateView();
		});

		// Add command to open the image slideshow view
		this.addCommand({
			id: 'imageview-open-slideshow',
			name: 'Open Image Slideshow',
			callback: () => {
				this.activateView();
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
				workspace.revealLeaf(leaf);
			}
		} else {
			// If view already exists, close it (toggle behavior)
			leaf.detach();
		}
	}

	onunload() {
		// Detach all image slideshow views
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_IMAGE_SLIDESHOW);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
