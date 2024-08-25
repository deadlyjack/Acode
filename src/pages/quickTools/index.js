export default async function QuickToolsSettings() {
	const { default: Settings } = await import("./quickTools.js");
	Settings();
}
