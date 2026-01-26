import {App, PluginSettingTab, Setting} from "obsidian";
import ImageViewPlugin from "./main";

export interface ImageViewSettings {
	defaultFolderPath: string;
	slideshowInterval: number;
	autoplayOnOpen: boolean;
	loopSlideshow: boolean;
	showControls: boolean;
	fitImageMode: 'contain' | 'cover' | 'fill';
}

export const DEFAULT_SETTINGS: ImageViewSettings = {
	defaultFolderPath: 'Images',
	slideshowInterval: 3000,
	autoplayOnOpen: false,
	loopSlideshow: true,
	showControls: true,
	fitImageMode: 'contain'
}

export class ImageViewSettingTab extends PluginSettingTab {
	plugin: ImageViewPlugin;

	constructor(app: App, plugin: ImageViewPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Image Slideshow Settings'});

		// Default Folder Path
		new Setting(containerEl)
			.setName('Default folder path')
			.setDesc('Path to folder containing images (e.g., Images)')
			.addText(text => text
				.setPlaceholder('Images')
				.setValue(this.plugin.settings.defaultFolderPath)
				.onChange(async (value) => {
					this.plugin.settings.defaultFolderPath = value;
					await this.plugin.saveSettings();
				}));

		// Slideshow Interval
		new Setting(containerEl)
			.setName('Slideshow interval')
			.setDesc('Time between images in milliseconds (500-10000)')
			.addText(text => text
				.setPlaceholder('3000')
				.setValue(String(this.plugin.settings.slideshowInterval))
				.onChange(async (value) => {
					const num = Number(value);
					if (!isNaN(num) && num >= 500 && num <= 10000) {
						this.plugin.settings.slideshowInterval = num;
						await this.plugin.saveSettings();
					}
				}));

		// Autoplay on Open
		new Setting(containerEl)
			.setName('Autoplay on open')
			.setDesc('Start slideshow automatically when view opens')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.autoplayOnOpen)
				.onChange(async (value) => {
					this.plugin.settings.autoplayOnOpen = value;
					await this.plugin.saveSettings();
				}));

		// Loop Slideshow
		new Setting(containerEl)
			.setName('Loop slideshow')
			.setDesc('Return to first image after last image')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.loopSlideshow)
				.onChange(async (value) => {
					this.plugin.settings.loopSlideshow = value;
					await this.plugin.saveSettings();
				}));

		// Show Controls
		new Setting(containerEl)
			.setName('Show controls')
			.setDesc('Display playback controls in the view')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showControls)
				.onChange(async (value) => {
					this.plugin.settings.showControls = value;
					await this.plugin.saveSettings();
				}));

		// Fit Image Mode
		new Setting(containerEl)
			.setName('Fit image mode')
			.setDesc('How images should be sized in the view')
			.addDropdown(dropdown => dropdown
				.addOption('contain', 'Contain')
				.addOption('cover', 'Cover')
				.addOption('fill', 'Fill')
				.setValue(this.plugin.settings.fitImageMode)
				.onChange(async (value) => {
					this.plugin.settings.fitImageMode = value as 'contain' | 'cover' | 'fill';
					await this.plugin.saveSettings();
				}));
	}
}
