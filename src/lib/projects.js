const projects = {
	html() {
		acode.addIcon(
			"html-project-icon",
			"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABIUExURUdwTORPJuRPJuNOJeRPJuNQJ+RPJuNOJuNPJuROJeRPJuNOJuRPJuRQJONPJuNPJeVQI+NPJeROJuNPJuZPJ+NOJuRPJuNPJkmKsooAAAAXdFJOUwA6h5uxKGh/60/VE8BBll8izqXdDHT3jnqTYwAAAQRJREFUGBl9wY22azAURtGFhMS/Vvu9/5veHeGMMrhzAvoPkqBHgWTRo4XE6ZEjqfSoImn0qCGpZQYuBpmaJMpMXESZSFLIfLioZQoSLzMCzYmMJ+lkXsBbVx0bmR546YosSGqBUheBbJEUuFgkLWROpuMsSHJklYznTKYiK2WaHwWsMiXZRxceZpkP2SQzGO1mKGQmsigTwWvXQZSJZIVMDZ12K9QyBdks0wBDuUjvVw00MjNZJ1OxmWc2o0zHLkhynl9OUuDQyoS+jGx8PfZfSS2HXrvg6unVatdzcLrlOIy6NXIog26Ekj9+qlqdtNXkOSua/qvNt28Kbq1xfL/HuPLjH4f8MW+juHZUAAAAAElFTkSuQmCC",
		);
		return {
			async files() {
				return {
					"index.html":
						'<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <link rel="stylesheet" href="css/index.css">\n  <script src="js/index.js"></script>\n  <title><%name%></title>\n</head>\n<body>\n\t<h1><%name%></h1>\n</body>\n</html>',
					"css/index.css": "",
					"js/index.js": "",
				};
			},
			icon: "html-project-icon",
		};
	},
};

export default {
	list() {
		return Object.keys(projects).map((project) => ({
			name: project,
			icon: projects[project]().icon,
		}));
	},
	get(project) {
		return projects[project]?.();
	},
	/**
	 *
	 * @param {string} project Project name
	 * @param {()=>Promise<Map<string, string>>} files Async function that returns a map of files
	 * @param {string} iconSrc Icon source (data url)
	 */
	set(project, files, iconSrc) {
		const icon = `${project}-project-icon`;
		acode.addIcon(`${project}-project-icon`, iconSrc);
		projects[project] = () => ({ files, icon });
	},
	delete(project) {
		delete projects[project];
	},
};
