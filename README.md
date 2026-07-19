# line-multi-selector

Select entire lines from the editor gutter with contiguous and non-contiguous multi-line selection.

# Installation

## From Obsidian Community Plugins
- After the plugin is approved, open Settings > Community plugins, search for `line-multi-selector`, then install and enable it.

## Manual Installation
1. Download main.js and manifest.json from the latest release page.
2. Copy both files into `/.obsidian/plugins/line-multi-selector/` under your vault directory.
3. Reload Obsidian and enable this plugin under Settings > Community Plugins.

# Features
1. Click any line number to select the entire line.
2. Ctrl/Cmd + Click: Toggle selection status to add or remove a single line from the current selection range.
3. Shift + Click: Select contiguous content between two lines.
4. Hold LMB and drag: Quickly select a block of contiguous lines.
5. When appending selections via Method 2, new selections will be added to the remembered selection set.

# Usage
|Operation|Effect|
|---|---|
|1. Click any line number|Select the entire line|
|2. Ctrl/Cmd + Click|Toggle selection status to add or remove a single line from the current selection range.|
|3. Shift + Click|Select contiguous content between two lines.|
|4. Hold LMB and drag|Quickly select a block of contiguous lines.|
- When appending selections via Method 2, new selections will be added to the remembered selection set.

# Compatibility
- Requires Obsidian 0.15.0 or later.
