import { ItemView, WorkspaceLeaf, TFile, TFolder, normalizePath } from 'obsidian';
import ImageViewPlugin from './main';

export const VIEW_TYPE_IMAGE_SLIDESHOW = "image-slideshow-view";

export class ImageSlideshowView extends ItemView {
	plugin: ImageViewPlugin;

	// State properties
	private currentFolderPath: string;
	private imageFiles: TFile[];
	private currentImageIndex: number;
	private isPlaying: boolean;
	private slideshowInterval: number | null;

	// DOM elements
	private imageContainerEl: HTMLElement;
	private imageEl: HTMLImageElement;
	private controlsEl: HTMLElement;
	private statusEl: HTMLElement;
	private errorEl: HTMLElement;
	private playPauseBtn: HTMLButtonElement;

	constructor(leaf: WorkspaceLeaf, plugin: ImageViewPlugin) {
		super(leaf);
		this.plugin = plugin;
		this.currentFolderPath = '';
		this.imageFiles = [];
		this.currentImageIndex = 0;
		this.isPlaying = false;
		this.slideshowInterval = null;
	}

	// Required abstract methods from ItemView
	getViewType(): string {
		return VIEW_TYPE_IMAGE_SLIDESHOW;
	}

	getDisplayText(): string {
		return "Image Slideshow";
	}

	getIcon(): string {
		return "images";
	}

	async onOpen(): Promise<void> {
		const container = this.containerEl.children[1];
		if (!container) return;

		container.empty();
		container.addClass('imageview-slideshow-container');

		// Build the UI structure
		this.buildUI(container as HTMLElement);

		// Load images from default folder if configured
		const defaultPath = this.plugin.settings.defaultFolderPath;

		if (defaultPath) {
			this.loadImagesFromFolder(defaultPath);
		} else {
			this.showError('No folder found.\n\nPlease set a folder path in the plugin settings.');
		}
	}

	async onClose(): Promise<void> {
		// Cleanup is handled automatically by registerInterval
		this.stopSlideshow();
	}

	private buildUI(container: HTMLElement): void {
		// Controls bar
		this.controlsEl = container.createDiv({ cls: 'imageview-controls' });

		// Only show controls if setting is enabled
		if (!this.plugin.settings.showControls) {
			this.controlsEl.style.display = 'none';
		}

		// Previous button
		const prevBtn = this.controlsEl.createEl('button', {
			text: '◀◀',
			attr: { 'aria-label': 'Previous image' }
		});
		prevBtn.addEventListener('click', () => this.previousImage());

		// Play/Pause button (in the middle)
		this.playPauseBtn = this.controlsEl.createEl('button', {
			text: '▶',
			attr: { 'aria-label': 'Play/Pause' }
		});
		this.playPauseBtn.addEventListener('click', () => {
			if (this.isPlaying) {
				this.stopSlideshow();
				this.playPauseBtn.setText('▶');
			} else {
				this.startSlideshow();
				this.playPauseBtn.setText('⏸');
			}
		});

		// Next button
		const nextBtn = this.controlsEl.createEl('button', {
			text: '▶▶',
			attr: { 'aria-label': 'Next image' }
		});
		nextBtn.addEventListener('click', () => this.nextImage());

		// Refresh button
		const refreshBtn = this.controlsEl.createEl('button', {
			text: '↻',
			attr: { 'aria-label': 'Refresh folder' }
		});
		refreshBtn.addEventListener('click', () => this.refreshFolder());

		// Image container
		this.imageContainerEl = container.createDiv({ cls: 'imageview-image-container' });
		this.imageEl = this.imageContainerEl.createEl('img', { cls: 'imageview-image' });

		// Apply fit mode from settings
		this.imageEl.style.objectFit = this.plugin.settings.fitImageMode;

		this.imageEl.addEventListener('error', () => {
			const currentFile = this.imageFiles[this.currentImageIndex];
			if (currentFile) {
				console.error('Failed to load image:', currentFile.path);
			}
			// Try to skip to next image on error
			if (this.imageFiles.length > 1) {
				this.nextImage();
			} else {
				this.showError('Failed to load image');
			}
		});

		// Error display (hidden by default)
		this.errorEl = container.createDiv({ cls: 'imageview-error' });
		this.errorEl.style.display = 'none';

		// Status bar
		this.statusEl = container.createDiv({ cls: 'imageview-status' });
		this.statusEl.setText('No images loaded');
	}

	private loadImagesFromFolder(folderPath: string): void {
		this.clearError();

		if (!folderPath || folderPath.trim() === '') {
			this.showError(`No folder path configured.\n\nPlease set a folder path in the plugin settings.`);
			return;
		}

		const folder = this.app.vault.getAbstractFileByPath(normalizePath(folderPath));

		if (!folder) {
			const allFolders = this.app.vault.getAllLoadedFiles()
				.filter(f => f instanceof TFolder)
				.map(f => f.path)
				.filter(p => p !== '')
				.slice(0, 10);

			const folderList = allFolders.length > 0
				? `\n\nAvailable folders:\n${allFolders.join('\n')}`
				: '\n\nNo folders found in vault.';

			this.showError(`Folder not found: "${folderPath}"${folderList}\n\nPlease check the folder path in settings.`);
			return;
		}

		if (!(folder instanceof TFolder)) {
			this.showError(`Path is not a folder: ${folderPath}\n\nPlease enter a valid folder path in settings.`);
			return;
		}

		this.imageFiles = this.filterImageFiles(folder.children);

		if (this.imageFiles.length === 0) {
			this.showError(`No images found in folder: ${folderPath}\n\nSupported formats: PNG, JPG, JPEG, GIF, WEBP, SVG, BMP`);
			return;
		}

		this.currentFolderPath = folderPath;
		this.currentImageIndex = 0;
		this.displayImage(0);

		if (this.plugin.settings.autoplayOnOpen) {
			this.startSlideshow();
			this.playPauseBtn.setText('⏸');
		}
	}

	private displayImage(index: number): void {
		if (index < 0 || index >= this.imageFiles.length) {
			return;
		}

		const file = this.imageFiles[index];
		if (!file) return;

		const resourcePath = this.app.vault.getResourcePath(file);

		this.imageEl.src = resourcePath;
		this.imageEl.style.display = 'block';
		this.currentImageIndex = index;

		this.statusEl.setText(
			`Image ${index + 1} of ${this.imageFiles.length} | ${file.name}`
		);
	}

	private nextImage(): void {
		if (this.imageFiles.length === 0) {
			return;
		}

		let nextIndex = this.currentImageIndex + 1;

		if (nextIndex >= this.imageFiles.length) {
			if (this.plugin.settings.loopSlideshow) {
				nextIndex = 0;
			} else {
				// Stop at the end if not looping
				this.stopSlideshow();
				this.playPauseBtn.setText('▶');
				return;
			}
		}

		this.displayImage(nextIndex);
	}

	private previousImage(): void {
		if (this.imageFiles.length === 0) {
			return;
		}

		let prevIndex = this.currentImageIndex - 1;

		if (prevIndex < 0) {
			prevIndex = this.imageFiles.length - 1;
		}

		this.displayImage(prevIndex);
	}

	private startSlideshow(): void {
		if (this.imageFiles.length === 0) {
			return;
		}

		// Clear any existing interval
		this.stopSlideshow();

		const interval = window.setInterval(() => {
			this.nextImage();
		}, this.plugin.settings.slideshowInterval);

		this.slideshowInterval = this.registerInterval(interval);
		this.isPlaying = true;
	}

	private stopSlideshow(): void {
		if (this.slideshowInterval !== null) {
			window.clearInterval(this.slideshowInterval);
			this.slideshowInterval = null;
		}
		this.isPlaying = false;
	}

	private filterImageFiles(children: any[]): TFile[] {

		const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'];
		const results: TFile[] = [];

		for (const child of children) {
			if (child instanceof TFile) {
				const isImage = imageExtensions.includes(child.extension?.toLowerCase());

				if (isImage) {
					results.push(child);
				}
			}
		}

		return results.sort((a, b) => a.name.localeCompare(b.name));
	}

	private showError(message: string): void {
		this.errorEl.setText(message);
		this.errorEl.style.display = 'block';
		this.imageContainerEl.style.display = 'none';
		this.statusEl.setText('Error - see above');
	}

	private clearError(): void {
		this.errorEl.style.display = 'none';
		this.imageContainerEl.style.display = 'flex';
	}

	private refreshFolder(): void {
		if (this.currentFolderPath) {
			this.loadImagesFromFolder(this.currentFolderPath);
		}
	}

	// State persistence
	getState(): any {
		return {
			folderPath: this.currentFolderPath,
			currentIndex: this.currentImageIndex
		};
	}

	async setState(state: any, result: any): Promise<void> {
		if (state?.folderPath) {
			this.loadImagesFromFolder(state.folderPath);

			// Restore image index if valid
			if (typeof state.currentIndex === 'number' &&
			    state.currentIndex >= 0 &&
			    state.currentIndex < this.imageFiles.length) {
				this.displayImage(state.currentIndex);
			}
		}
	}
}
