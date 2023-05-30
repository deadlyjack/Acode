let regex;
let caseSensitive = false;

/**
 * @param {RegExp} search 
 * @param {boolean} caseSensitivity 
 */
export default function (search, caseSensitivity) {
  regex = search;
  caseSensitive = caseSensitivity;
}

define("ace/mode/search_result_highlight_rules", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text_highlight_rules"], function (require, exports, module) {
  const oop = require("../lib/oop");
  const { TextHighlightRules } = require("./text_highlight_rules");

  oop.inherits(YamlHighlightRules, TextHighlightRules);
  exports.YamlHighlightRules = YamlHighlightRules;

  function YamlHighlightRules() {
    this.$rules = {
      "start": [{
        token: "constant.language.boolean",
        get regex() {
          return regex;
        },
        set regex(value) {
          regex = value;
        },
        caseInsensitive: !caseSensitive,
      }],
      "mlStringPre": [
        {
          token: "indent",
          regex: /^ *$/
        }, {
          token: "indent",
          regex: /^ */,
          onMatch: function (val, state, stack) {
            var curIndent = stack[1];
            if (curIndent >= val.length) {
              this.next = "start";
              stack.shift();
              stack.shift();
            }
            else {
              stack[1] = val.length - 1;
              this.next = stack[0] = "mlString";
            }
            return this.token;
          },
          next: "mlString"
        }, {
          defaultToken: "string"
        }
      ],
      "mlString": [
        {
          token: "indent",
          regex: /^ *$/
        }, {
          token: "indent",
          regex: /^ */,
          onMatch: function (val, state, stack) {
            var curIndent = stack[1];
            if (curIndent >= val.length) {
              this.next = "start";
              stack.splice(0);
            }
            else {
              this.next = "mlString";
            }
            return this.token;
          },
          next: "mlString"
        }, {
          token: "string",
          regex: '.+'
        }
      ]
    };
    this.normalizeRules();
  };
});

define("ace/mode/matching_brace_outdent", ["require", "exports", "module", "ace/range"], function (require, exports, module) {
  const { Range } = require("../range");

  function MatchingBraceOutdent() { };
  exports.MatchingBraceOutdent = MatchingBraceOutdent;

  (function () {
    this.checkOutdent = function (line, input) {
      if (!/^\s+$/.test(line))
        return false;
      return /^\s*\}/.test(input);
    };
    this.autoOutdent = function (doc, row) {
      var line = doc.getLine(row);
      var match = line.match(/^(\s*\})/);
      if (!match)
        return 0;
      var column = match[1].length;
      var openBracePos = doc.findMatchingBracket({ row: row, column: column });
      if (!openBracePos || openBracePos.row == row)
        return 0;
      var indent = this.$getIndent(doc.getLine(openBracePos.row));
      doc.replace(new Range(row, 0, row, column - 1), indent);
    };
    this.$getIndent = function (line) {
      return line.match(/^\s*/)[0];
    };
  }).call(MatchingBraceOutdent.prototype);
});

define("ace/mode/folding/coffee", ["require", "exports", "module", "ace/lib/oop", "ace/mode/folding/fold_mode", "ace/range"], function (require, exports, module) {
  const oop = require("../../lib/oop");
  const { FoldMode: BaseFoldMode } = require("./fold_mode");
  const { Range } = require("../../range");

  function FoldMode() { };
  oop.inherits(FoldMode, BaseFoldMode);
  exports.FoldMode = FoldMode;

  (function () {
    this.getFoldWidgetRange = function (session, foldStyle, row) {
      var range = this.indentationBlock(session, row);
      if (range)
        return range;
      var re = /\S/;
      var line = session.getLine(row);
      var startLevel = line.search(re);
      if (startLevel == -1 || line[startLevel] != "#")
        return;
      var startColumn = line.length;
      var maxRow = session.getLength();
      var startRow = row;
      var endRow = row;
      while (++row < maxRow) {
        line = session.getLine(row);
        var level = line.search(re);
        if (level == -1)
          continue;
        if (line[level] != "#")
          break;
        endRow = row;
      }
      if (endRow > startRow) {
        var endColumn = session.getLine(endRow).length;
        return new Range(startRow, startColumn, endRow, endColumn);
      }
    };
    this.getFoldWidget = function (session, foldStyle, row) {
      var line = session.getLine(row);
      var indent = line.search(/\S/);
      var next = session.getLine(row + 1);
      var prev = session.getLine(row - 1);
      var prevIndent = prev.search(/\S/);
      var nextIndent = next.search(/\S/);
      if (indent == -1) {
        session.foldWidgets[row - 1] = prevIndent != -1 && prevIndent < nextIndent ? "start" : "";
        return "";
      }
      if (prevIndent == -1) {
        if (indent == nextIndent && line[indent] == "#" && next[indent] == "#") {
          session.foldWidgets[row - 1] = "";
          session.foldWidgets[row + 1] = "";
          return "start";
        }
      }
      else if (prevIndent == indent && line[indent] == "#" && prev[indent] == "#") {
        if (session.getLine(row - 2).search(/\S/) == -1) {
          session.foldWidgets[row - 1] = "start";
          session.foldWidgets[row + 1] = "";
          return "";
        }
      }
      if (prevIndent != -1 && prevIndent < indent)
        session.foldWidgets[row - 1] = "start";
      else
        session.foldWidgets[row - 1] = "";
      if (indent < nextIndent)
        return "start";
      else
        return "";
    };
  }).call(FoldMode.prototype);
});

define("ace/mode/search_result", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text", "ace/mode/yaml_highlight_rules", "ace/mode/matching_brace_outdent", "ace/mode/folding/coffee", "ace/worker/worker_client"], function (require, exports, module) {
  const oop = require("../lib/oop");
  const { Mode: TextMode } = require("./text");
  const { YamlHighlightRules } = require("./search_result_highlight_rules");
  const { MatchingBraceOutdent } = require("./matching_brace_outdent");
  const { FoldMode } = require("./folding/coffee");

  function Mode() {
    this.HighlightRules = YamlHighlightRules;
    this.$outdent = new MatchingBraceOutdent();
    this.foldingRules = new FoldMode();
    this.$behaviour = this.$defaultBehaviour;
  };
  oop.inherits(Mode, TextMode);
  exports.Mode = Mode;

  (function () {
    this.lineCommentStart = ["#"];
    this.getNextLineIndent = function (state, line, tab) {
      var indent = this.$getIndent(line);
      if (state == "start") {
        var match = line.match(/^.*[\{\(\[]\s*$/);
        if (match) {
          indent += tab;
        }
      }
      return indent;
    };
    this.checkOutdent = function (state, line, input) {
      return this.$outdent.checkOutdent(line, input);
    };
    this.autoOutdent = function (state, doc, row) {
      this.$outdent.autoOutdent(doc, row);
    };
    this.createWorker = function () { };
    this.$id = "ace/mode/search_result";
  }).call(Mode.prototype);
});

ace.require(["ace/mode/search_result"], function (m) {
  if (typeof module == "object" && typeof exports == "object" && module) {
    module.exports = m;
  }
});