export default function Commands() {
  let lang = ace.require('ace/lib/lang');
  let config = ace.require('ace/config');
  let Range = ace.require('ace/range').Range;
  const { clipboard } = cordova.plugins;

  function bindKey(win) {
    return {
      win: keyBindings(win),
    };
  }

  let commands = [
    {
      name: 'closeCurrentTab',
      description: 'Close current tab',
      bindKey: bindKey('closeCurrentTab'),
      exec: function () {
        acode.exec('close-current-tab');
      },
    },
    {
      name: 'closeAllTabs',
      description: 'Close all tabs',
      bindKey: bindKey('closeAllTabs'),
      exec: function () {
        acode.exec('close-all-tabs');
      },
    },
    {
      name: 'newFile',
      description: 'Create new file',
      bindKey: bindKey('newFile'),
      exec: function () {
        if (acode) {
          acode.exec('new-file');
        }
      },
      readOnly: true,
    },
    {
      name: 'openFile',
      description: 'Open a file',
      bindKey: bindKey('openFile'),
      exec: function () {
        if (acode) {
          acode.exec('open-file');
        }
      },
      readOnly: true,
    },
    {
      name: 'openFolder',
      description: 'Open a folder',
      bindKey: bindKey('openFolder'),
      exec: function () {
        if (acode) {
          acode.exec('open-folder');
        }
      },
      readOnly: true,
    },
    {
      name: 'saveFile',
      description: 'Save current file',
      bindKey: bindKey('saveFile'),
      exec: function () {
        if (acode) {
          acode.exec('save');
        }
      },
      readOnly: true,
    },
    {
      name: 'saveFileAs',
      description: 'Save as current file',
      bindKey: bindKey('saveFileAs'),
      exec: function () {
        if (acode) {
          acode.exec('save-as');
        }
      },
      readOnly: true,
    },
    {
      name: 'nextFile',
      description: 'Open next file tab',
      bindKey: bindKey('nextFile'),
      exec: function () {
        if (acode) {
          acode.exec('next-file');
        }
      },
    },
    {
      name: 'prevFile',
      description: 'Open previous file tab',
      bindKey: bindKey('prevFile'),
      exec: function () {
        if (acode) {
          acode.exec('prev-file');
        }
      },
    },
    {
      name: 'showSettingsMenu',
      description: 'Show settings menu',
      bindKey: bindKey('showSettingsMenu'),
      exec: function () {
        if (acode) {
          acode.exec('open', 'settings');
        }
      },
      readOnly: true,
    },
    {
      name: 'renameFile',
      description: 'Rename active file',
      bindKey: bindKey('renameFile'),
      exec: function () {
        if (acode) {
          acode.exec('rename');
        }
      },
      readOnly: true,
    },
    {
      name: 'run',
      description: 'Preview HTML and MarkDown',
      bindKey: bindKey('run'),
      exec: function () {
        if (acode) {
          acode.exec('run');
        }
      },
      readOnly: true,
    },
    {
      name: 'selectWord',
      description: 'Select word',
      bindKey: bindKey('selectWord'),
      exec: function () {
        if (acode) {
          acode.exec('select-word');
        }
      },
      readOnly: true,
    },
    {
      name: 'toggleFullscreen',
      description: 'Toggle full screen mode',
      bindKey: bindKey('toggleFullscreen'),
      exec: function () {
        if (acode) {
          acode.exec('toggle-fullscreen');
        }
      },
    },
    {
      name: 'toggleSidebar',
      description: 'Toggle sidebar',
      bindKey: bindKey('toggleSidebar'),
      exec: function () {
        if (acode) {
          acode.exec('toggle-sidebar');
        }
      },
    },
    {
      name: 'toggleMenu',
      description: 'Toggle main menu',
      bindKey: bindKey('toggleMenu'),
      exec: function () {
        if (acode) {
          acode.exec('toggle-menu');
        }
      },
    },
    {
      name: 'toggleEditMenu',
      description: 'Toggle edit menu',
      bindKey: bindKey('toggleEditMenu'),
      exec: function () {
        if (acode) {
          acode.exec('toggle-editmenu');
        }
      },
    },
    {
      name: 'goToNextError',
      description: 'Go to next error',
      bindKey: bindKey('goToNextError'),
      exec: function (editor) {
        config.loadModule('./ext/error_marker', function (module) {
          module.showErrorMarker(editor, 1);
        });
      },
      scrollIntoView: 'animate',
      readOnly: true,
    },
    {
      name: 'goToPreviousError',
      description: 'Go to previous error',
      bindKey: bindKey('goToPreviousError'),
      exec: function (editor) {
        config.loadModule('./ext/error_marker', function (module) {
          module.showErrorMarker(editor, -1);
        });
      },
      scrollIntoView: 'animate',
      readOnly: true,
    },
    {
      name: 'selectall',
      description: 'Select all',
      bindKey: bindKey('selectall'),
      exec: function (editor) {
        editor.selectAll();
      },
      readOnly: true,
    },
    {
      name: 'centerselection',
      description: 'Center selection',
      bindKey: bindKey('centerselection'),
      exec: function (editor) {
        editor.centerSelection();
      },
      readOnly: true,
    },
    {
      name: 'gotoline',
      description: 'Go to line...',
      bindKey: bindKey('gotoline'),
      exec: function () {
        if (acode) {
          acode.exec('goto');
        }
      },
      readOnly: true,
    },
    {
      name: 'fold',
      bindKey: bindKey('fold'),
      exec: function (editor) {
        editor.session.toggleFold(false);
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'center',
      readOnly: true,
    },
    {
      name: 'unfold',
      bindKey: bindKey('unfold'),
      exec: function (editor) {
        editor.session.toggleFold(true);
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'center',
      readOnly: true,
    },
    {
      name: 'toggleFoldWidget',
      description: 'Toggle fold widget',
      bindKey: bindKey('toggleFoldWidget'),
      exec: function (editor) {
        editor.session.toggleFoldWidget();
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'center',
      readOnly: true,
    },
    {
      name: 'toggleParentFoldWidget',
      description: 'Toggle parent fold widget',
      bindKey: bindKey('toggleParentFoldWidget'),
      exec: function (editor) {
        editor.session.toggleFoldWidget(true);
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'center',
      readOnly: true,
    },
    {
      name: 'foldall',
      description: 'Fold all',
      bindKey: bindKey('foldall'),
      exec: function (editor) {
        editor.session.foldAll();
      },
      scrollIntoView: 'center',
      readOnly: true,
    },
    {
      name: 'foldOther',
      description: 'Fold other',
      bindKey: bindKey('foldOther'),
      exec: function (editor) {
        editor.session.foldAll();
        editor.session.unfold(editor.selection.getAllRanges());
      },
      scrollIntoView: 'center',
      readOnly: true,
    },
    {
      name: 'unfoldall',
      description: 'Unfold all',
      bindKey: bindKey('unfoldall'),
      exec: function (editor) {
        editor.session.unfold();
      },
      scrollIntoView: 'center',
      readOnly: true,
    },
    {
      name: 'findnext',
      description: 'Find next',
      bindKey: bindKey('findnext'),
      exec: function (editor) {
        editor.findNext();
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'center',
      readOnly: true,
    },
    {
      name: 'findprevious',
      description: 'Find previous',
      bindKey: bindKey('findprevious'),
      exec: function (editor) {
        editor.findPrevious();
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'center',
      readOnly: true,
    },
    {
      name: 'selectOrFindNext',
      description: 'Select or find next',
      bindKey: bindKey('selectOrFindNext'),
      exec: function (editor) {
        if (editor.selection.isEmpty()) editor.selection.selectWord();
        else editor.findNext();
      },
      readOnly: true,
    },
    {
      name: 'selectOrFindPrevious',
      description: 'Select or find previous',
      bindKey: bindKey('selectOrFindPrevious'),
      exec: function (editor) {
        if (editor.selection.isEmpty()) editor.selection.selectWord();
        else editor.findPrevious();
      },
      readOnly: true,
    },
    {
      name: 'find',
      description: 'Find',
      bindKey: bindKey('find'),
      exec: function () {
        if (acode) {
          acode.exec('find');
        }
      },
      readOnly: true,
    },
    {
      name: 'overwrite',
      description: 'Overwrite',
      bindKey: bindKey('overwrite'),
      exec: function (editor) {
        editor.toggleOverwrite();
      },
      readOnly: true,
    },
    {
      name: 'selecttostart',
      description: 'Select to start',
      bindKey: bindKey('selecttostart'),
      exec: function (editor) {
        editor.getSelection().selectFileStart();
      },
      multiSelectAction: 'forEach',
      readOnly: true,
      scrollIntoView: 'animate',
      aceCommandGroup: 'fileJump',
    },
    {
      name: 'gotostart',
      description: 'Go to start',
      bindKey: bindKey('gotostart'),
      exec: function (editor) {
        editor.navigateFileStart();
      },
      multiSelectAction: 'forEach',
      readOnly: true,
      scrollIntoView: 'animate',
      aceCommandGroup: 'fileJump',
    },
    {
      name: 'selectup',
      description: 'Select up',
      bindKey: bindKey('selectup'),
      exec: function (editor) {
        editor.getSelection().selectUp();
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'cursor',
      readOnly: true,
    },
    {
      name: 'golineup',
      description: 'Go line up',
      bindKey: bindKey('golineup'),
      exec: function (editor, args) {
        editor.navigateUp(args.times);
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'cursor',
      readOnly: true,
    },
    {
      name: 'selecttoend',
      description: 'Select to end',
      bindKey: bindKey('selecttoend'),
      exec: function (editor) {
        editor.getSelection().selectFileEnd();
      },
      multiSelectAction: 'forEach',
      readOnly: true,
      scrollIntoView: 'animate',
      aceCommandGroup: 'fileJump',
    },
    {
      name: 'gotoend',
      description: 'Go to end',
      bindKey: bindKey('gotoend'),
      exec: function (editor) {
        editor.navigateFileEnd();
      },
      multiSelectAction: 'forEach',
      readOnly: true,
      scrollIntoView: 'animate',
      aceCommandGroup: 'fileJump',
    },
    {
      name: 'selectdown',
      description: 'Select down',
      bindKey: bindKey('selectdown'),
      exec: function (editor) {
        editor.getSelection().selectDown();
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'cursor',
      readOnly: true,
    },
    {
      name: 'golinedown',
      description: 'Go line down',
      bindKey: bindKey('golinedown'),
      exec: function (editor, args) {
        editor.navigateDown(args.times);
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'cursor',
      readOnly: true,
    },
    {
      name: 'selectwordleft',
      description: 'Select word left',
      bindKey: bindKey('selectwordleft'),
      exec: function (editor) {
        editor.getSelection().selectWordLeft();
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'cursor',
      readOnly: true,
    },
    {
      name: 'gotowordleft',
      description: 'Go to word left',
      bindKey: bindKey('gotowordleft'),
      exec: function (editor) {
        editor.navigateWordLeft();
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'cursor',
      readOnly: true,
    },
    {
      name: 'selecttolinestart',
      description: 'Select to line start',
      bindKey: bindKey('selecttolinestart'),
      exec: function (editor) {
        editor.getSelection().selectLineStart();
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'cursor',
      readOnly: true,
    },
    {
      name: 'gotolinestart',
      description: 'Go to line start',
      bindKey: bindKey('gotolinestart'),
      exec: function (editor) {
        editor.navigateLineStart();
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'cursor',
      readOnly: true,
    },
    {
      name: 'selectleft',
      description: 'Select left',
      bindKey: bindKey('selectleft'),
      exec: function (editor) {
        editor.getSelection().selectLeft();
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'cursor',
      readOnly: true,
    },
    {
      name: 'gotoleft',
      description: 'Go to left',
      bindKey: bindKey('gotoleft'),
      exec: function (editor, args) {
        editor.navigateLeft(args.times);
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'cursor',
      readOnly: true,
    },
    {
      name: 'selectwordright',
      description: 'Select word right',
      bindKey: bindKey('selectwordright'),
      exec: function (editor) {
        editor.getSelection().selectWordRight();
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'cursor',
      readOnly: true,
    },
    {
      name: 'gotowordright',
      description: 'Go to word right',
      bindKey: bindKey('gotowordright'),
      exec: function (editor) {
        editor.navigateWordRight();
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'cursor',
      readOnly: true,
    },
    {
      name: 'selecttolineend',
      description: 'Select to line end',
      bindKey: bindKey('selecttolineend'),
      exec: function (editor) {
        editor.getSelection().selectLineEnd();
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'cursor',
      readOnly: true,
    },
    {
      name: 'gotolineend',
      description: 'Go to line end',
      bindKey: bindKey('gotolineend'),
      exec: function (editor) {
        editor.navigateLineEnd();
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'cursor',
      readOnly: true,
    },
    {
      name: 'selectright',
      description: 'Select right',
      bindKey: bindKey('selectright'),
      exec: function (editor) {
        editor.getSelection().selectRight();
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'cursor',
      readOnly: true,
    },
    {
      name: 'gotoright',
      description: 'Go to right',
      bindKey: bindKey('gotoright'),
      exec: function (editor, args) {
        editor.navigateRight(args.times);
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'cursor',
      readOnly: true,
    },
    {
      name: 'selectpagedown',
      description: 'Select page down',
      bindKey: bindKey('selectpagedown'),
      exec: function (editor) {
        editor.selectPageDown();
      },
      readOnly: true,
    },
    {
      name: 'pagedown',
      description: 'Page down',
      bindKey: bindKey('pagedown'),
      exec: function (editor) {
        editor.scrollPageDown();
      },
      readOnly: true,
    },
    {
      name: 'gotopagedown',
      description: 'Go to page down',
      bindKey: bindKey('gotopagedown'),
      exec: function (editor) {
        editor.gotoPageDown();
      },
      readOnly: true,
    },
    {
      name: 'selectpageup',
      description: 'Select page up',
      bindKey: bindKey('selectpageup'),
      exec: function (editor) {
        editor.selectPageUp();
      },
      readOnly: true,
    },
    {
      name: 'pageup',
      description: 'Page up',
      bindKey: bindKey('pageup'),
      exec: function (editor) {
        editor.scrollPageUp();
      },
      readOnly: true,
    },
    {
      name: 'gotopageup',
      description: 'Go to page up',
      bindKey: bindKey('gotopageup'),
      exec: function (editor) {
        editor.gotoPageUp();
      },
      readOnly: true,
    },
    {
      name: 'scrollup',
      description: 'Scroll up',
      bindKey: bindKey('scrollup'),
      exec: function (e) {
        e.renderer.scrollBy(0, -2 * e.renderer.layerConfig.lineHeight);
      },
      readOnly: true,
    },
    {
      name: 'scrolldown',
      description: 'Scroll down',
      bindKey: bindKey('scrolldown'),
      exec: function (e) {
        e.renderer.scrollBy(0, 2 * e.renderer.layerConfig.lineHeight);
      },
      readOnly: true,
    },
    {
      name: 'selectlinestart',
      description: 'Select line start',
      bindKey: bindKey('selectlinestart'),
      exec: function (editor) {
        editor.getSelection().selectLineStart();
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'cursor',
      readOnly: true,
    },
    {
      name: 'selectlineend',
      description: 'Select line end',
      bindKey: bindKey('selectlineend'),
      exec: function (editor) {
        editor.getSelection().selectLineEnd();
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'cursor',
      readOnly: true,
    },
    {
      name: 'togglerecording',
      description: 'Toggle recording',
      bindKey: bindKey('togglerecording'),
      exec: function (editor) {
        editor.commands.toggleRecording(editor);
      },
      readOnly: true,
    },
    {
      name: 'replaymacro',
      description: 'Replay macro',
      bindKey: bindKey('replaymacro'),
      exec: function (editor) {
        editor.commands.replay(editor);
      },
      readOnly: true,
    },
    {
      name: 'jumptomatching',
      description: 'Jump to matching',
      bindKey: bindKey('jumptomatching'),
      exec: function (editor) {
        editor.jumpToMatching();
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'animate',
      readOnly: true,
    },
    {
      name: 'selecttomatching',
      description: 'Select to matching',
      bindKey: bindKey('selecttomatching'),
      exec: function (editor) {
        editor.jumpToMatching(true);
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'animate',
      readOnly: true,
    },
    {
      name: 'expandToMatching',
      description: 'Expand to matching',
      bindKey: bindKey('expandToMatching'),
      exec: function (editor) {
        editor.jumpToMatching(true, true);
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'animate',
      readOnly: true,
    },
    {
      name: 'copy',
      description: 'Copy',
      exec: function (editor) {
        let copyText = editor.getCopyText();
        clipboard.copy(copyText);
        toast(strings['copied to clipboard']);
      },
      readOnly: true,
    },
    {
      name: 'cut',
      description: 'Cut',
      exec: function (editor) {
        let cutLine =
          editor.$copyWithEmptySelection && editor.selection.isEmpty();
        let range = cutLine
          ? editor.selection.getLineRange()
          : editor.selection.getRange();
        editor._emit('cut', range);
        if (!range.isEmpty()) {
          let copyText = editor.session.getTextRange(range);
          clipboard.copy(copyText);
          toast(strings['copied to clipboard']);
          editor.session.remove(range);
        }
        editor.clearSelection();
        editorManager.controls.update();
      },
      scrollIntoView: 'cursor',
      multiSelectAction: 'forEach',
    },
    {
      name: 'paste',
      description: 'Paste',
      exec: function () {
        clipboard.paste((text) => {
          editorManager.editor.$handlePaste(text);
          editorManager.controls.update();
        });
      },
      scrollIntoView: 'cursor',
    },
    {
      name: 'removeline',
      description: 'Remove line',
      bindKey: bindKey('removeline'),
      exec: function (editor) {
        editor.removeLines();
      },
      scrollIntoView: 'cursor',
      multiSelectAction: 'forEachLine',
    },
    {
      name: 'duplicateSelection',
      description: 'Duplicate selection',
      bindKey: bindKey('duplicateSelection'),
      exec: function (editor) {
        editor.duplicateSelection();
      },
      scrollIntoView: 'cursor',
      multiSelectAction: 'forEach',
    },
    {
      name: 'sortlines',
      description: 'Sort lines',
      bindKey: bindKey('sortlines'),
      exec: function (editor) {
        editor.sortLines();
      },
      scrollIntoView: 'selection',
      multiSelectAction: 'forEachLine',
    },
    {
      name: 'togglecomment',
      description: 'Toggle comment',
      bindKey: bindKey('togglecomment'),
      exec: function (editor) {
        editor.toggleCommentLines();
      },
      multiSelectAction: 'forEachLine',
      scrollIntoView: 'selectionPart',
    },
    {
      name: 'toggleBlockComment',
      description: 'Toggle block comment',
      bindKey: bindKey('toggleBlockComment'),
      exec: function (editor) {
        editor.toggleBlockComment();
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'selectionPart',
    },
    {
      name: 'modifyNumberUp',
      description: 'Modify number up',
      bindKey: bindKey('modifyNumberUp'),
      exec: function (editor) {
        editor.modifyNumber(1);
      },
      scrollIntoView: 'cursor',
      multiSelectAction: 'forEach',
    },
    {
      name: 'modifyNumberDown',
      description: 'Modify number down',
      bindKey: bindKey('modifyNumberDown'),
      exec: function (editor) {
        editor.modifyNumber(-1);
      },
      scrollIntoView: 'cursor',
      multiSelectAction: 'forEach',
    },
    {
      name: 'replace',
      description: 'Replace',
      bindKey: bindKey('replace'),
      exec: function (editor) {
        if (acode) {
          acode.exec('replace');
        }
      },
    },
    {
      name: 'undo',
      description: 'Undo',
      bindKey: bindKey('undo'),
      exec: function (editor) {
        editor.undo();
      },
    },
    {
      name: 'redo',
      description: 'Redo',
      bindKey: bindKey('redo'),
      exec: function (editor) {
        editor.redo();
      },
    },
    {
      name: 'copylinesup',
      description: 'Copy lines up',
      bindKey: bindKey('copylinesup'),
      exec: function (editor) {
        editor.copyLinesUp();
      },
      scrollIntoView: 'cursor',
    },
    {
      name: 'movelinesup',
      description: 'Move lines up',
      bindKey: bindKey('movelinesup'),
      exec: function (editor) {
        editor.moveLinesUp();
      },
      scrollIntoView: 'cursor',
    },
    {
      name: 'copylinesdown',
      description: 'Copy lines down',
      bindKey: bindKey('copylinesdown'),
      exec: function (editor) {
        editor.copyLinesDown();
      },
      scrollIntoView: 'cursor',
    },
    {
      name: 'movelinesdown',
      description: 'Move lines down',
      bindKey: bindKey('movelinesdown'),
      exec: function (editor) {
        editor.moveLinesDown();
      },
      scrollIntoView: 'cursor',
    },
    {
      name: 'del',
      description: 'Delete',
      bindKey: bindKey('del'),
      exec: function (editor) {
        editor.remove('right');
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'cursor',
    },
    {
      name: 'backspace',
      description: 'Backspace',
      bindKey: bindKey('backspace'),
      exec: function (editor) {
        editor.remove('left');
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'cursor',
    },
    {
      name: 'cut_or_delete',
      description: 'Cut or delete',
      bindKey: bindKey('cut_or_delete'),
      exec: function (editor) {
        if (editor.selection.isEmpty()) {
          editor.remove('left');
        } else {
          return false;
        }
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'cursor',
    },
    {
      name: 'removetolinestart',
      description: 'Remove to line start',
      bindKey: bindKey('removetolinestart'),
      exec: function (editor) {
        editor.removeToLineStart();
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'cursor',
    },
    {
      name: 'removetolineend',
      description: 'Remove to line end',
      bindKey: bindKey('removetolineend'),
      exec: function (editor) {
        editor.removeToLineEnd();
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'cursor',
    },
    {
      name: 'removetolinestarthard',
      description: 'Remove to line start hard',
      bindKey: bindKey('removetolinestarthard'),
      exec: function (editor) {
        let range = editor.selection.getRange();
        range.start.column = 0;
        editor.session.remove(range);
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'cursor',
    },
    {
      name: 'removetolineendhard',
      description: 'Remove to line end hard',
      bindKey: bindKey('removetolineendhard'),
      exec: function (editor) {
        let range = editor.selection.getRange();
        range.end.column = Number.MAX_VALUE;
        editor.session.remove(range);
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'cursor',
    },
    {
      name: 'removewordleft',
      description: 'Remove word left',
      bindKey: bindKey('removewordleft'),
      exec: function (editor) {
        editor.removeWordLeft();
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'cursor',
    },
    {
      name: 'removewordright',
      description: 'Remove word right',
      bindKey: bindKey('removewordright'),
      exec: function (editor) {
        editor.removeWordRight();
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'cursor',
    },
    {
      name: 'outdent',
      description: 'Outdent',
      bindKey: bindKey('outdent'),
      exec: function (editor) {
        editor.blockOutdent();
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'selectionPart',
    },
    {
      name: 'indent',
      description: 'Indent',
      bindKey: bindKey('indent'),
      exec: function (editor) {
        editor.indent();
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'selectionPart',
    },
    {
      name: 'blockoutdent',
      description: 'Block outdent',
      bindKey: bindKey('blockoutdent'),
      exec: function (editor) {
        editor.blockOutdent();
      },
      multiSelectAction: 'forEachLine',
      scrollIntoView: 'selectionPart',
    },
    {
      name: 'blockindent',
      description: 'Block indent',
      bindKey: bindKey('blockindent'),
      exec: function (editor) {
        editor.blockIndent();
      },
      multiSelectAction: 'forEachLine',
      scrollIntoView: 'selectionPart',
    },
    {
      name: 'insertstring',
      description: 'Insert string',
      exec: function (editor, str) {
        editor.insert(str);
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'cursor',
    },
    {
      name: 'inserttext',
      description: 'Insert text',
      exec: function (editor, args) {
        editor.insert(lang.stringRepeat(args.text || '', args.times || 1));
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'cursor',
    },
    {
      name: 'splitline',
      description: 'Split line',
      bindKey: bindKey('splitline'),
      exec: function (editor) {
        editor.splitLine();
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'cursor',
    },
    {
      name: 'transposeletters',
      description: 'Transpose letters',
      bindKey: bindKey('transposeletters'),
      exec: function (editor) {
        editor.transposeLetters();
      },
      multiSelectAction: function (editor) {
        editor.transposeSelections(1);
      },
      scrollIntoView: 'cursor',
    },
    {
      name: 'touppercase',
      description: 'To uppercase',
      bindKey: bindKey('touppercase'),
      exec: function (editor) {
        editor.toUpperCase();
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'cursor',
    },
    {
      name: 'tolowercase',
      description: 'To lowercase',
      bindKey: bindKey('tolowercase'),
      exec: function (editor) {
        editor.toLowerCase();
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'cursor',
    },
    {
      name: 'autoindent',
      description: 'Auto Indent',
      bindKey: bindKey('autoindent'),
      exec: function (editor) {
        editor.autoIndent();
      },
      multiSelectAction: 'forEachLine',
      scrollIntoView: 'animate',
    },
    {
      name: 'expandtoline',
      description: 'Expand to line',
      bindKey: bindKey('expandtoline'),
      exec: function (editor) {
        let range = editor.selection.getRange();
        range.start.column = range.end.column = 0;
        range.end.row++;
        editor.selection.setRange(range, false);
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'cursor',
      readOnly: true,
    },
    {
      name: 'joinlines',
      description: 'Join lines',
      bindKey: bindKey('joinlines'),
      exec: function (editor) {
        let isBackwards = editor.selection.isBackwards();
        let selectionStart = isBackwards
          ? editor.selection.getSelectionLead()
          : editor.selection.getSelectionAnchor();
        let selectionEnd = isBackwards
          ? editor.selection.getSelectionAnchor()
          : editor.selection.getSelectionLead();
        let firstLineEndCol = editor.session.doc.getLine(
          selectionStart.row,
        ).length;
        let selectedText = editor.session.doc.getTextRange(
          editor.selection.getRange(),
        );
        let selectedCount = selectedText.replace(/\n\s*/, ' ').length;
        let insertLine = editor.session.doc.getLine(selectionStart.row);
        for (let i = selectionStart.row + 1; i <= selectionEnd.row + 1; i++) {
          let curLine = lang.stringTrimLeft(
            lang.stringTrimRight(editor.session.doc.getLine(i)),
          );
          if (curLine.length !== 0) {
            curLine = ' ' + curLine;
          }
          insertLine += curLine;
        }
        if (selectionEnd.row + 1 < editor.session.doc.getLength() - 1) {
          insertLine += editor.session.doc.getNewLineCharacter();
        }
        editor.clearSelection();
        editor.session.doc.replace(
          new Range(selectionStart.row, 0, selectionEnd.row + 2, 0),
          insertLine,
        );
        if (selectedCount > 0) {
          editor.selection.moveCursorTo(
            selectionStart.row,
            selectionStart.column,
          );
          editor.selection.selectTo(
            selectionStart.row,
            selectionStart.column + selectedCount,
          );
        } else {
          firstLineEndCol =
            editor.session.doc.getLine(selectionStart.row).length >
              firstLineEndCol
              ? firstLineEndCol + 1
              : firstLineEndCol;
          editor.selection.moveCursorTo(selectionStart.row, firstLineEndCol);
        }
      },
      multiSelectAction: 'forEach',
      readOnly: true,
    },
    {
      name: 'invertSelection',
      description: 'Invert selection',
      bindKey: bindKey('invertSelection'),
      exec: function (editor) {
        let endRow = editor.session.doc.getLength() - 1;
        let endCol = editor.session.doc.getLine(endRow).length;
        let ranges = editor.selection.rangeList.ranges;
        let newRanges = [];
        if (ranges.length < 1) {
          ranges = [editor.selection.getRange()];
        }
        for (let i = 0; i < ranges.length; i++) {
          if (i == ranges.length - 1) {
            if (
              !(ranges[i].end.row === endRow && ranges[i].end.column === endCol)
            ) {
              newRanges.push(
                new Range(
                  ranges[i].end.row,
                  ranges[i].end.column,
                  endRow,
                  endCol,
                ),
              );
            }
          }
          if (i === 0) {
            if (!(ranges[i].start.row === 0 && ranges[i].start.column === 0)) {
              newRanges.push(
                new Range(0, 0, ranges[i].start.row, ranges[i].start.column),
              );
            }
          } else {
            newRanges.push(
              new Range(
                ranges[i - 1].end.row,
                ranges[i - 1].end.column,
                ranges[i].start.row,
                ranges[i].start.column,
              ),
            );
          }
        }
        editor.exitMultiSelectMode();
        editor.clearSelection();
        for (let i = 0; i < newRanges.length; i++) {
          editor.selection.addRange(newRanges[i], false);
        }
      },
      readOnly: true,
      scrollIntoView: 'none',
    },
    {
      name: 'addLineAfter',
      description: 'Add new line after the current line',
      exec: function (editor) {
        editor.selection.clearSelection();
        editor.navigateLineEnd();
        editor.insert('\n');
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'cursor',
    },
    {
      name: 'addLineBefore',
      description: 'Add new line before the current line',
      exec: function (editor) {
        editor.selection.clearSelection();
        let cursor = editor.getCursorPosition();
        editor.selection.moveTo(cursor.row - 1, Number.MAX_VALUE);
        editor.insert('\n');
        if (cursor.row === 0) editor.navigateUp();
      },
      multiSelectAction: 'forEach',
      scrollIntoView: 'cursor',
    },
    {
      name: 'openCommandPallete',
      description: 'Open command pallete',
      bindKey: bindKey('openCommandPallete'),
      exec: function (editor) {
        editor.prompt({
          $type: 'commands',
        });
      },
      readOnly: true,
    },
    {
      name: 'modeSelect',
      description: 'Change language mode...',
      bindKey: bindKey('modeSelect'),
      exec: function () {
        acode.exec('syntax');
      },
      readOnly: true,
    },
  ];

  for (let i = 1; i < 9; i++) {
    commands.push({
      name: 'foldToLevel' + i,
      description: 'Fold To Level ' + i,
      level: i,
      exec: function (editor) {
        editor.session.foldToLevel(this.level);
      },
      scrollIntoView: 'center',
      readOnly: true,
    });
  }

  return commands;
}