const projects = {
    html() {
        acode.addIcon(
            "html-project-icon",
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABIUExURUdwTORPJuRPJuNOJeRPJuNQJ+RPJuNOJuNPJuROJeRPJuNOJuRPJuRQJONPJuNPJeVQI+NPJeROJuNPJuZPJ+NOJuRPJuNPJkmKsooAAAAXdFJOUwA6h5uxKGh/60/VE8BBll8izqXdDHT3jnqTYwAAAQRJREFUGBl9wY22azAURtGFhMS/Vvu9/5veHeGMMrhzAvoPkqBHgWTRo4XE6ZEjqfSoImn0qCGpZQYuBpmaJMpMXESZSFLIfLioZQoSLzMCzYmMJ+lkXsBbVx0bmR546YosSGqBUheBbJEUuFgkLWROpuMsSHJklYznTKYiK2WaHwWsMiXZRxceZpkP2SQzGO1mKGQmsigTwWvXQZSJZIVMDZ12K9QyBdks0wBDuUjvVw00MjNZJ1OxmWc2o0zHLkhynl9OUuDQyoS+jGx8PfZfSS2HXrvg6unVatdzcLrlOIy6NXIog26Ekj9+qlqdtNXkOSua/qvNt28Kbq1xfL/HuPLjH4f8MW+juHZUAAAAAElFTkSuQmCC"
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

    express() {
        acode.addIcon(
            "express-project-icon",
            "data:image/png;base64,...your express icon data here..."
        );
        return {
            async files() {
                return {
                    "app.js":
                        `const express = require('express');\n` +
                        `const app = express();\n\n` +
                        `app.get('/', (req, res) => {\n` +
                        `    res.send('Hello, Express!');\n` +
                        `});\n\n` +
                        `app.listen(3000, () => {\n` +
                        `    console.log('Server running on http://localhost:3000');\n` +
                        `});`,
                    "routes/index.js":
                        `const express = require('express');\n` +
                        `const router = express.Router();\n\n` +
                        `router.get('/', (req, res) => {\n` +
                        `    res.send('Welcome to the Express app!');\n` +
                        `});\n\n` +
                        `module.exports = router;`,
                    "package.json":
                        `{\n` +
                        `  "name": "express-app",\n` +
                        `  "version": "1.0.0",\n` +
                        `  "description": "A basic Express app",\n` +
                        `  "main": "app.js",\n` +
                        `  "scripts": {\n` +
                        `    "start": "node app.js"\n` +
                        `  },\n` +
                        `  "dependencies": {\n` +
                        `    "express": "^4.17.1"\n` +
                        `  }\n` +
                        `}`,
                };
            },
            icon: "express-project-icon",
        };
    },

    gofiber() {
        acode.addIcon(
            "gofiber-project-icon",
            "data:image/png;base64,Cjxzdmcgdmlld0JveD0iMCAwIDgwMCAzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0iIzMzMyI+PHBhdGggZD0ibTIzOS4yNSA2OS41OGgxMTcuODRsLTUuNzQgMzMuODloLTc2LjExbC01LjczIDM1LjRoNjguNjFsLTUuNzMgMzRoLTY4LjYxbC0xMS40NyA2OS4zN2gtNDEuNzJ6Ii8+PHBhdGggZD0ibTM1OSAxMTIuNzRoNDEuMjJsLTIxLjU0IDEyOS40N2gtNDEuMjJ6bTUtMzQuODljMS43LTEwLjg1IDEyLjQxLTE5LjY0IDI0LTE5LjY0czE5Ljg1IDguNzkgMTguNDEgMTkuNjQtMTIuMjIgMTkuNzItMjMuODUgMTkuNzItMjAuMTQtOC45NC0xOC41Ni0xOS43MnoiLz48cGF0aCBkPSJtNDIxLjYxIDY5LjU4aDQxLjIxbC0xMC43IDY1LjMzaC44OGM2Ljc0LTExLjg5IDIwLjE1LTIzLjg1IDQwLjYzLTIzLjg1IDI3LjA2IDAgNDggMjAuODIgNDAuMzcgNjYuNS03LjI1IDQ0LjA4LTM0LjIyIDY2LjUtNjIuODggNjYuNS0xOS41NSAwLTI5LjMzLTEwLjg3LTMyLjM2LTIyLjg0aC0xLjYxbC0zLjM3IDIxaC00MC43OHptNDAuNzEgMTQyLjQyYzE1LjE3IDAgMjYtMTMuNTcgMjkuMzMtMzQuNDdzLTIuNy0zNC4yMy0xOC0zNC4yM2MtMTUuMDkgMC0yNi4xMyAxMy4wNy0yOS41IDM0LjIzLTMuNDEgMjAuOTMgMy4wOCAzNC40NyAxOC4xNyAzNC40N3oiLz48cGF0aCBkPSJtNTM4Ljc5IDE3OGM2LjY1LTQwLjEyIDM2LjMyLTY2LjkyIDc1LjM1LTY2LjkyIDM2Ljc1IDAgNTguNjcgMjMuNTEgNTEuNTkgNjYuMDhsLTEuNjEgMTAuMjhoLTg2LjIybC0uMjYgMS41MmMtMi42MSAxNi40NCA1LjE0IDI2IDIxLjI0IDI2IDEwLjcxIDAgMjAtNC41NSAyNC43LTEzLjIzbDM3LjU5IDEuMDljLTkuMTggMjUuNDYtMzMuODggNDEuODktNjggNDEuODktNDAuNjUtLjA2LTYxLjM4LTI1LjM0LTU0LjM4LTY2Ljcxem05MC44Ni0xNC41YzIuMTEtMTMuMjMtNS44Mi0yMi42Ny0xOS4zLTIyLjY3LTEzLjMyIDAtMjUuMTIgOS44Ni0yOC4wNyAyMi42N3oiLz48cGF0aCBkPSJtNjg1LjggMTEyLjc0aDQwbC00IDIzLjZoMS4zNWM3LjY3LTE3LjExIDIwLjM5LTI1LjM0IDM0LjU1LTI1LjM0YTQ5IDQ5IDAgMCAxIDExLjMgMS40bC02LjA3IDM1LjkxYy0zLjc5LTEuNDMtMTAuNzktMi4xOS0xNS45My0yLjE5LTE0LjU4IDAtMjcuMjMgMTAuMzctMjkuOTIgMjUuNzlsLTExLjY0IDcwLjNoLTQxLjIxeiIvPjwvZz48cGF0aCBkPSJtMjEzLjc3IDExNS40MWgtMTM0LjUxbC0xMC43NiAxNS4yNyAxNDIuNzgtLjA4eiIgZmlsbD0iIzAwYWNkNyIvPjxwYXRoIGQ9Im0yMDkuMDIgMTQ3LjA2aC0xNzQuMDdsLTExLjA3IDE1LjIxIDE4Mi42NS0uMTN6IiBmaWxsPSIjMDBhY2Q3Ii8+PHBhdGggZD0ibTIwNC4yNyAxNzguN2gtNzQuMzdsLTEwIDE1LjI3IDgxLjg4LS4wNnoiIGZpbGw9IiMwMGFjZDciLz48L3N2Zz4K"
        );
        return {
            async files() {
                return {
                    "go.mod":
                        `module gofiber-app\n\n` +
                        `go 1.20\n\n` +
                        `require github.com/gofiber/fiber/v2 v2.37.0`,
                    "main.go":
                        `package main\n\n` +
                        `import (\n` +
                        `  "github.com/gofiber/fiber/v2"\n` +
                        `)\n\n` +
                        `func main() {\n` +
                        `  app := fiber.New()\n\n` +
                        `  app.Get("/", func(c *fiber.Ctx) error {\n` +
                        `    return c.SendString("Hello, Go Fiber!")\n` +
                        `  })\n\n` +
                        `  app.Listen(":3000")\n` +
                        `}\n`,
                };
            },
            icon: "gofiber-project-icon",
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
