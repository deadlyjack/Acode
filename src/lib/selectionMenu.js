const exec = (command) => {
	const { editor } = editorManager;
	editor.execCommand(command);

	if (command === "selectall") {
		editor.scrollToRow(Number.POSITIVE_INFINITY);
		editor.setSelection(true);
		editor.setMenu(true);
	}
	editor.focus();
};

const items = [];

export default function selectionMenu() {
	return [
		item(
			() => exec("copy"),
			<span className="icon copy"></span>,
			"selected",
			true,
		),
		item(() => exec("cut"), <span className="icon cut"></span>, "selected"),
		item(() => exec("paste"), <span className="icon paste"></span>, "all"),
		item(
			() => exec("selectall"),
			<span className="icon text_format"></span>,
			"all",
			true,
		),
		item(
			(color) => acode.exec("insert-color", color),
			<span className="icon color_lenspalette"></span>,
			"all",
		),
		...items,
	];
}

/**
 *
 * @param {function} onclick function to be called when the item is clicked
 * @param {string | HTMLElement} text content of the item
 * @param {'selected'|'all'} mode mode supported by the item
 * @param {boolean} readOnly whether to show the item in readOnly mode
 */
selectionMenu.add = (onclick, text, mode, readOnly) => {
	items.push(item(onclick, text, mode, readOnly));
};

selectionMenu.exec = (command) => {
	exec(command);
};

function item(onclick, text, mode = "all", readOnly = false) {
	return { onclick, text, mode, readOnly };
}
