import settingsPage from "components/settingsPage";

export default function help() {
	const title = strings.help;
	const items = [
		{
			key: "help",
			text: strings.help,
			link: "https://telegram.me/foxdebug_acode",
		},
		{
			key: "faqs",
			text: strings.faqs,
			link: "https://acode.app/faqs",
		},
		{
			key: "bug_report",
			text: strings.bug_report,
			link: "https://github.com/deadlyjack/Acode/issues",
		},
	];

	const page = settingsPage(title, items, () => {}, "separate");
	page.show();
}
