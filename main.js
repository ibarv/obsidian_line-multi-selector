const { Plugin } = require('obsidian');
const { ViewPlugin } = require('@codemirror/view');
const { EditorSelection } = require('@codemirror/state');

module.exports = class LineMultiSelectPlugin extends Plugin {
  async onload() {
    this.settings = Object.assign({
      gutterExpandWidth: 20
    }, await this.loadData());

    const plugin = this;

    class GutterSelectPlugin {
      constructor(view) {
        this.view = view;
        this.dom = view.dom;
        this.selectedLines = new Set();
        this.baseLine = null;
        this.isDragging = false;
        this.dragStartLine = null;
        this.lastDragLine = null;
        this.plugin = plugin;

        this._handlers = {
          mousedown: this.onMouseDown.bind(this),
          mousemove: this.onMouseMove.bind(this),
          mouseup: this.onMouseUp.bind(this),
          contextmenu: this.onContextMenu.bind(this)
        };

        for (const [type, handler] of Object.entries(this._handlers)) {
          this.dom.addEventListener(type, handler, true);
        }
      }

      selectSingleLine(lineNumber) {
        this.selectedLines.clear();
        this.selectedLines.add(lineNumber);
        this.baseLine = lineNumber;
        this.syncContiguousSelection(lineNumber, lineNumber);
      }

      toggleLineSelection(lineNumber) {
        if (this.selectedLines.has(lineNumber)) {
          this.selectedLines.delete(lineNumber);
          if (this.baseLine === lineNumber) {
            this.baseLine = this.getMinSelectedLine();
          }
        } else {
          this.selectedLines.add(lineNumber);
          this.baseLine = lineNumber;
        }
        this.syncSelection();
      }

      extendSelectionTo(lineNumber) {
        const anchor = this.baseLine ?? this.getPrimaryLine();
        if (anchor === null) {
          this.selectSingleLine(lineNumber);
          return;
        }
        this.setRangeSelection(anchor, lineNumber);
      }

      setRangeSelection(startLine, endLine) {
        const [min, max] = startLine < endLine ? [startLine, endLine] : [endLine, startLine];
        this.selectedLines.clear();
        for (let i = min; i <= max; i++) {
          this.selectedLines.add(i);
        }
        this.baseLine = startLine;
        this.syncContiguousSelection(min, max);
      }

      getPrimaryLine() {
        return this.getMinSelectedLine() ?? this.view.state.doc.lineAt(this.view.state.selection.main.head).number;
      }

      getMinSelectedLine() {
        if (this.selectedLines.size === 0) {
          return null;
        }

        let minLine = Infinity;
        for (const line of this.selectedLines) {
          if (line < minLine) {
            minLine = line;
          }
        }

        return minLine;
      }

      isClickInLineNumbers(e) {
        const gutters = this.dom.querySelector('.cm-gutters');
        if (!gutters) return false;

        const rect = gutters.getBoundingClientRect();
        const expandWidth = this.plugin.settings.gutterExpandWidth ?? 0;

        return e.clientX >= rect.left - expandWidth &&
               e.clientX <= rect.right &&
               e.clientY >= rect.top &&
               e.clientY <= rect.bottom;
      }

      getLineAtClick(e) {
        const doc = this.view.state.doc;
        const pos = this.view.posAtCoords({ x: e.clientX, y: e.clientY });
        if (pos !== null) {
          return doc.lineAt(pos).number;
        }

        const rect = this.dom.getBoundingClientRect();
        const block = this.view.lineBlockAtHeight(e.clientY - rect.top + (this.view.scrollTop || 0));
        return block ? doc.lineAt(block.from).number : null;
      }

      dispatchSelection(ranges) {
        if (ranges.length === 0) {
          return;
        }

        this.view.dispatch({
          selection: EditorSelection.create(ranges, ranges.length - 1),
          scrollIntoView: false,
        });
      }

      // 修改：将连续行拆分为每行独立的 Selection Range，消除跨行 Range
      syncContiguousSelection(startLine, endLine) {
        const doc = this.view.state.doc;
        const lineCount = doc.lines;
        const fromLine = Math.max(1, startLine);
        const toLine = Math.min(lineCount, endLine);

        if (fromLine > toLine) {
          return;
        }

        const ranges = [];
        for (let i = fromLine; i <= toLine; i++) {
          ranges.push(EditorSelection.range(doc.line(i).from, doc.line(i).to));
        }

        this.dispatchSelection(ranges);
      }

      // 修改：连续块同样逐行拆分为独立 Range
      syncSelection() {
        if (this.selectedLines.size === 0) return;

        const doc = this.view.state.doc;
        const lineCount = doc.lines;
        const ranges = [];
        let rangeStart = null;
        let rangeEnd = null;
        const sortedLines = [];

        for (const line of this.selectedLines) {
          if (line < 1 || line > lineCount) continue;
          sortedLines.push(line);
        }

        if (sortedLines.length === 0) {
          return;
        }

        if (sortedLines.length > 1) {
          sortedLines.sort((a, b) => a - b);
        }

        for (const line of sortedLines) {
          if (rangeStart === null) {
            rangeStart = line;
            rangeEnd = line;
          } else if (line === rangeEnd + 1) {
            rangeEnd = line;
          } else {
            // 连续块逐行拆分为独立 Range
            for (let i = rangeStart; i <= rangeEnd; i++) {
              ranges.push(EditorSelection.range(doc.line(i).from, doc.line(i).to));
            }
            rangeStart = line;
            rangeEnd = line;
          }
        }

        if (rangeStart !== null) {
          // 末尾连续块同样逐行拆分
          for (let i = rangeStart; i <= rangeEnd; i++) {
            ranges.push(EditorSelection.range(doc.line(i).from, doc.line(i).to));
          }
        }

        this.dispatchSelection(ranges);
      }

      resetDragState() {
        this.isDragging = false;
        this.dragStartLine = null;
        this.lastDragLine = null;
      }

      clearSelectionState() {
        this.selectedLines.clear();
        this.baseLine = null;
        this.resetDragState();
      }

      onMouseDown(e) {
        if (e.button !== 0 || !this.isClickInLineNumbers(e)) return;

        const clickedLine = this.getLineAtClick(e);
        if (clickedLine === null) return;

        e.preventDefault();
        e.stopPropagation();

        const ctrl = e.ctrlKey || e.metaKey;
        const shift = e.shiftKey;

        if (shift) {
          this.extendSelectionTo(clickedLine);
        } else if (ctrl) {
          this.toggleLineSelection(clickedLine);
        } else {
          this.isDragging = true;
          this.dragStartLine = clickedLine;
          this.lastDragLine = clickedLine;
          this.selectSingleLine(clickedLine);
        }
      }

      onMouseMove(e) {
        if (!this.isDragging) return;

        const currentLine = this.getLineAtClick(e);
        if (currentLine === null || currentLine === this.lastDragLine) return;

        e.preventDefault();
        e.stopPropagation();

        this.lastDragLine = currentLine;
        this.setRangeSelection(this.dragStartLine, currentLine);
      }

      onMouseUp() {
        this.resetDragState();
      }

      onContextMenu() {
        if (this.selectedLines.size > 0) {
          this.syncSelection();
        }
      }

      update(update) {
        if (update.docChanged) {
          this.clearSelectionState();
        }
      }

      destroy() {
        for (const [type, handler] of Object.entries(this._handlers)) {
          this.dom.removeEventListener(type, handler, true);
        }
      }
    }

    this.registerEditorExtension(ViewPlugin.fromClass(GutterSelectPlugin));
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
};