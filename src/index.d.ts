type LanguageMap = { [key: string]: string };
declare const strings: LanguageMap;
declare const ASSETS_DIRECTORY: string;
declare const DATA_STORAGE: string;
declare const CACHE_STORAGE: string;
declare const PLUGIN_DIR: string;
declare const KEYBINDING_FILE: string;
declare const IS_FREE_VERSION: string;
declare const ANDROID_SDK_INT: number;
declare const DOES_SUPPORT_THEME: boolean;
declare const acode: object;

interface Window {
	ASSETS_DIRECTORY: string;
	DATA_STORAGE: string;
	CACHE_STORAGE: string;
	PLUGIN_DIR: string;
	KEYBINDING_FILE: string;
	IS_FREE_VERSION: string;
	ANDROID_SDK_INT: number;
	DOES_SUPPORT_THEME: boolean;
	acode: object;
}

interface String {
	/**
	 * Capitalize the first letter of a string
	 */
	capitalize(): string;
	/**
	 * Generate a hash from a string
	 */
	hash(): string;
}
