# Obsidian ImageView Plugin

[ImageView_Demo.webm](https://github.com/user-attachments/assets/ae10f8f2-cfdb-4976-8798-dbaa25121d12)


A slideshow plugin for Obsidian that displays images from a folder in your vault with automatic cycling and playback controls.

## Features

- **Slideshow View**: Display images from a specified folder in a dedicated view panel
- **Automatic Cycling**: Auto-play slideshow with configurable interval (500-10000ms)
- **Playback Controls**: Previous, Play/Pause, Next, and Refresh buttons
- **Flexible Display**: Choose between contain, cover, or fill image modes
- **Customizable Settings**:
  - Set default folder path for images
  - Configure slideshow interval
  - Enable/disable autoplay on view open
  - Toggle looping behavior
  - Show/hide playback controls
  - Show/hide status bar (image index and filename)
- **Smart Performance**: Automatically pauses slideshow when browser tab is hidden or when switching to another pane
- **State Persistence**: Remembers your current folder and image position across sessions
- **Supported Formats**: PNG, JPG, JPEG, GIF, WEBP, SVG, BMP

## Installation

### From Community Plugins

Within Obsidian, search for ImageView in the Community Plugins browser and install it directly.

### Manual Installation

1. Download the latest release files: `main.js`, `styles.css`, `manifest.json`
2. Create a folder named `obsidian-imageview` in your vault's `.obsidian/plugins/` directory
3. Copy the downloaded files into the new folder
4. Reload Obsidian
5. Enable the plugin in Settings → Community plugins

## How to Use

### Opening the Slideshow View

1. Click the images icon in the left ribbon bar, or
2. Use the command palette (Ctrl/Cmd+P) and search for "Open image slideshow"

### Setting Up Your Image Folder

1. Go to Settings → ImageView
2. Set the "Default folder path" to your images folder (e.g., `Images` or `Media/Photos`)
3. The view will automatically load images from this folder

### Controls

- **◀◀ Previous**: Go to previous image
- **▶/⏸ Play/Pause**: Start or pause the automatic slideshow
- **▶▶ Next**: Go to next image
- **↻ Refresh**: Reload the folder to detect new or removed images

### Settings

| Setting | Description | Default |
|---------|-------------|---------|
| Default folder path | Path to folder containing images | `Images` |
| Slideshow interval | Time between images in milliseconds | `3000` |
| Autoplay on open | Start slideshow automatically when view opens | `false` |
| Loop slideshow | Return to first image after last image | `true` |
| Show controls | Display playback controls in the view | `true` |
| Show status bar | Display image index and filename at the bottom | `true` |
| Fit image mode | How images should be sized (contain/cover/fill) | `contain` |

## Development

### Setup

1. Clone this repository into your vault's `.obsidian/plugins/` folder
2. Install dependencies: `npm install`
3. Start development mode: `npm run dev`
4. Make changes and reload Obsidian to see updates

### Building

- Development build: `npm run dev`
- Production build: `npm run build`

## Support

For issues, feature requests, or contributions, please visit the [GitHub repository](https://github.com/larryn000/obsidian-imageview).

