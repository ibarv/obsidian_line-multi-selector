[📖 中文文档](./.doc/README-zn.md)

# Introduction

- Realize multi-line selection via gutter interactions — contiguous multi-selection, non-contiguous multi-selection, append selection, toggle selection status, and remember selection status.

# Installation

## Install via Obsidian Community Plugins

- Open the plugin marketplace, search for "line-multi-selector", and click Install.

## Manual Installation

1. Download main.js and manifest.json from the latest release page.
2. Copy both files into the `/.obsidian/plugins/line-multi-select/` folder under your vault directory.
3. Reload Obsidian and enable this plugin under Settings > Community Plugins.

# Features

1. Click any line number to select the entire line.
2. Ctrl / Cmd + Click: Toggle selection status to add or remove a single line from the current selection range.
3. Shift + Click: Select contiguous content between two lines.
4. Hold left mouse button and drag: Quickly select a block of contiguous lines.
5. When appending selections via Method 2, new selections will be added to the remembered selection set.

# Usage

- Note: Line number display must be enabled (Settings - Editor - Line numbers) for the plugin to work.

|Operation|Effect|
|---|---|
|1. Click any line number|Select the entire line|
|2. Ctrl / Cmd + Click|Toggle selection status to add or remove a single line from the current selection range|
|3. Shift + Click|Select contiguous content between two lines|
|4. Hold left mouse button and drag|Quickly select a block of contiguous lines|
- When appending selections via Method 2, new selections will be added to the remembered selection set.

# Compatibility

- Requires Obsidian version 0.15.0 or later.