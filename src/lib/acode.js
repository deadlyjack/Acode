import Contextmenu from "components/contextmenu";
import inputhints from "components/inputhints";
import Page from "components/page";
import palette from "components/palette";
import settingsPage from "components/settingsPage";
import SideButton from "components/sideButton";
import toast from "components/toast";
import tutorial from "components/tutorial";
import alert from "dialogs/alert";
import box from "dialogs/box";
import colorPicker from "dialogs/color";
import confirm from "dialogs/confirm";
import loader from "dialogs/loader";
import multiPrompt from "dialogs/multiPrompt";
import prompt from "dialogs/prompt";
import select from "dialogs/select";
import fsOperation from "fileSystem";
import keyboardHandler from "handlers/keyboard";
import windowResize from "handlers/windowResize";
import actionStack from "lib/actionStack";
import commands from "lib/commands";
import EditorFile from "lib/editorFile";
import files from "lib/fileList";
import fonts from "lib/fonts";
import openFolder from "lib/openFolder";
import projects from "lib/projects";
import selectionMenu from "lib/selectionMenu";
import appSettings from "lib/settings";
import FileBrowser from "pages/fileBrowser";
import formatterSettings from "settings/formatterSettings";
import sidebarApps from "sidebarApps";
import ThemeBuilder from "theme/builder";
import themes from "theme/list";
import Url from "utils/Url";
import Color from "utils/color";
import encodings from "utils/encodings";
import helpers from "utils/helpers";
import KeyboardEvent from "utils/keyboardEvent";

import { addMode, removeMode } from "ace/modelist";
import { addIntentHandler, removeIntentHandler } from "handlers/intent";
import { addedFolder } from "lib/openFolder";
import { decode, encode } from "utils/encodings";

export default class Acode {
	#modules = {};
	#pluginsInit = {};
	#pluginUnmount = {};
	#formatter = [
		{
			id: "default",
			name: "Default",
			exts: ["*"],
			format: async () => {
				const { beautify } = ace.require("ace/ext/beautify");
				const cursorPos = editorManager.editor.getCursorPosition();
				beautify(editorManager.editor.session);
				editorManager.editor.gotoLine(cursorPos.row + 1, cursorPos.column);
			},
		},
	];

	constructor() {
		const encodingsModule = {
			get encodings() {
				return encodings;
			},
			encode,
			decode,
		};

		const themesModule = {
			add: themes.add,
			get: themes.get,
			list: themes.list,
			update: themes.update,
			// Deprecated, not supported anymore
			apply: () => {},
		};

		const sidebarAppsModule = {
			add: sidebarApps.add,
			get: sidebarApps.get,
			remove: sidebarApps.remove,
		};

		const aceModes = {
			addMode,
			removeMode,
		};

		const intent = {
			addHandler: addIntentHandler,
			removeHandler: removeIntentHandler,
		};

		this.define("Url", Url);
		this.define("page", Page);
		this.define("Color", Color);
		this.define("fonts", fonts);
		this.define("toast", toast);
		this.define("alert", alert);
		this.define("select", select);
		this.define("loader", loader);
		this.define("dialogBox", box);
		this.define("prompt", prompt);
		this.define("intent", intent);
		this.define("fileList", files);
		this.define("fs", fsOperation);
		this.define("confirm", confirm);
		this.define("helpers", helpers);
		this.define("palette", palette);
		this.define("projects", projects);
		this.define("tutorial", tutorial);
		this.define("aceModes", aceModes);
		this.define("themes", themesModule);
		this.define("settings", appSettings);
		this.define("sideButton", SideButton);
		this.define("EditorFile", EditorFile);
		this.define("inputhints", inputhints);
		this.define("openfolder", openFolder);
		this.define("colorPicker", colorPicker);
		this.define("actionStack", actionStack);
		this.define("multiPrompt", multiPrompt);
		this.define("addedfolder", addedFolder);
		this.define("contextMenu", Contextmenu);
		this.define("fileBrowser", FileBrowser);
		this.define("fsOperation", fsOperation);
		this.define("keyboard", keyboardHandler);
		this.define("windowResize", windowResize);
		this.define("encodings", encodingsModule);
		this.define("themeBuilder", ThemeBuilder);
		this.define("selectionMenu", selectionMenu);
		this.define("sidebarApps", sidebarAppsModule);
		this.define("createKeyboardEvent", KeyboardEvent);
		this.define("toInternalUrl", helpers.toInternalUri);
	}

	/**
	 * Define a module
	 * @param {string} name
	 * @param {Object|function} module
	 */
	define(name, module) {
		this.#modules[name.toLowerCase()] = module;
	}

	require(module) {
		return this.#modules[module.toLowerCase()];
	}

	exec(key, val) {
		if (key in commands) {
			return commands[key](val);
		} else {
			return false;
		}
	}

	get exitAppMessage() {
		const numFiles = editorManager.hasUnsavedFiles();
		if (numFiles) {
			return strings["unsaved files close app"];
		}
	}

	setLoadingMessage(message) {
		document.body.setAttribute("data-small-msg", message);
	}

	/**
	 * Sets plugin init function
	 * @param {string} id
	 * @param {() => void} initFunction
	 * @param {{list: import('components/settingsPage').ListItem[], cb: (key: string, value: string)=>void}} settings
	 */
	setPluginInit(id, initFunction, settings) {
		this.#pluginsInit[id] = initFunction;

		if (!settings) return;
		appSettings.uiSettings[`plugin-${id}`] = settingsPage(
			id,
			settings.list,
			settings.cb,
		);
	}

	setPluginUnmount(id, unmountFunction) {
		this.#pluginUnmount[id] = unmountFunction;
	}

	/**
	 *
	 * @param {string} id plugin id
	 * @param {string} baseUrl local plugin url
	 * @param {HTMLElement} $page
	 */
	async initPlugin(id, baseUrl, $page, options) {
		if (id in this.#pluginsInit) {
			await this.#pluginsInit[id](baseUrl, $page, options);
		}
	}

	unmountPlugin(id) {
		if (id in this.#pluginUnmount) {
			this.#pluginUnmount[id]();
			fsOperation(Url.join(CACHE_STORAGE, id)).delete();
		}

		delete appSettings.uiSettings[`plugin-${id}`];
	}

	registerFormatter(id, extensions, format) {
		this.#formatter.unshift({
			id,
			exts: extensions,
			format,
		});
	}

	unregisterFormatter(id) {
		this.#formatter = this.#formatter.filter(
			(formatter) => formatter.id !== id,
		);
		const { formatter } = appSettings.value;
		Object.keys(formatter).forEach((mode) => {
			if (formatter[mode] === id) {
				delete formatter[mode];
			}
		});
		appSettings.update(false);
	}

	async format(selectIfNull = true) {
		const file = editorManager.activeFile;
		const name = (file.session.getMode().$id || "").split("/").pop();
		const formatterId = appSettings.value.formatter[name];
		const formatter = this.#formatter.find(({ id }) => id === formatterId);

		await formatter?.format();

		if (!formatter && selectIfNull) {
			formatterSettings(name);
			this.#afterSelectFormatter(name);
			return;
		} else if (!formatter && !selectIfNull) {
			toast(strings["please select a formatter"]);
		}
	}

	#afterSelectFormatter(name) {
		appSettings.on("update:formatter", format);

		function format() {
			appSettings.off("update:formatter", format);
			const id = appSettings.value.formatter[name];
			const formatter = this.#formatter.find(({ id: _id }) => _id === id);
			formatter?.format();
		}
	}

	fsOperation(file) {
		return fsOperation(file);
	}

	newEditorFile(filename, options) {
		new EditorFile(filename, options);
	}

	get formatters() {
		return this.#formatter.map(({ id, name, exts }) => ({
			id,
			name: name || id,
			exts,
		}));
	}

	/**
	 *
	 * @param {string[]} extensions
	 * @returns {Array<[id: String, name: String]>} options
	 */
	getFormatterFor(extensions) {
		const options = [[null, strings.none]];
		this.formatters.forEach(({ id, name, exts }) => {
			const supports = exts.some((ext) => extensions.includes(ext));
			if (supports || exts.includes("*")) {
				options.push([id, name]);
			}
		});
		return options;
	}

	alert(title, message, onhide) {
		alert(title, message, onhide);
	}

	loader(title, message, cancel) {
		return loader.create(title, message, cancel);
	}

	joinUrl(...args) {
		return Url.join(...args);
	}

	addIcon(className, src) {
		let style = document.head.get(`style[icon="${className}"]`);
		if (!style) {
			style = (
				<style
					icon={className}
				>{`.icon.${className}{background-image: url(${src})}`}</style>
			);
			document.head.appendChild(style);
		}
	}

	async prompt(message, defaultValue, type, options) {
		const response = await prompt(message, defaultValue, type, options);
		return response;
	}

	async confirm(title, message) {
		const confirmation = await confirm(title, message);
		return confirmation;
	}

	async select(title, options, config) {
		const response = await select(title, options, config);
		return response;
	}

	async multiPrompt(title, inputs, help) {
		const values = await multiPrompt(title, inputs, help);
		return values;
	}

	async fileBrowser(mode, info, openLast) {
		const res = await FileBrowser(mode, info, openLast);
		return res;
	}

	async toInternalUrl(url) {
		url = await helpers.toInternalUri(url);
		return url;
	}
}
