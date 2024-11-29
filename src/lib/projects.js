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
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAADIUlEQVR4nO2YTYhNYRjHf9c1RilMimsMjexsKAtszE5KiGxm7XPB1pRQFoMFRY2arFhZkEmEEqGMRhSKBWZofDSaxndmwczoqf/VO+eec895771zZzTnV6dpzn2e//l6nud9nhdSUlJSUlJSJg9Tgc3AKeAR8B0YAb4AXUA7sAHIMkGpAfYCb3TjccdbYCeQidBrBn4CF4CGCt1jA3BRuqZfwCKg07nJJ8ABYCUwH5gG1AOrgIPAU8f2NrAg4sKnZfMKqCvzIeqkMyLdApYDA84FLazisK+wBXgtvx5gcYhdLfBQNpeLfL04MvIfkZ7pjqIR+CiDa8As/DD7606ozQmxaXReVAul0SL/AemNwpL1sfMQ2TKKww3pdETYrAeGgd9Ak6d+k/yGpVPADiecfL9EkNlAt/SiQvOIfrcIyCXUzTkRY/6hFaov5sK+bJWelewwsioM+QIRFwHZJPZrnepUagIGMZ1n0rXqFveGW2P0WpN8wTMyshJbSQ5J93A5MY9HTnXpgrZOVJLV0r1XRhVq9KlyH2SYNOmSUi9d6w7iwvBSyLpQ4yzMV5KE/R8ZV7pfykr3V8KV2hZSd6XOdwI9STuBfHsxFvhorwAGZX9Wfwd1vuIX88VXe3egGd1VysXG8kjKDKBfPv36/798kHMBv/OlPMh4kw+rH8Am4JtveOUTrKAdriJuojfrXLNvwufXEav744FbetsCv7X5lOC7Ml5H9Ykbkmp9hrGjMjxG9dlXbEgKaVPMPrYnelfl3ZA1CRrGsMbR/CJ5rofZTmVYopDtjigi8zxa+LBW3vyLDkJ9xYw8JsSXRUqn71Dl7XdTRneA6ZSGbRVdlU6nOtiShqRyhrG5yhMzuqU368NMZxflU8RGnMX6UIkbD8FhbKhYbi0F3utmeoGNCeaAjGb9XvmZ/7Ix2gpKtCWUx36477QuNnvv1+ydU7jkVO3s/AvH9gGwMETTXQ86KrA3kJFO1PrzD0ukPc5bjjusO9gGTInQa1O4HS8j/4KYzgnpBjuCAmoUXie1gWdV7SvwWcncrl2YCbsbn5KSkpKSMqn4C7OqTrF1asWzAAAAAElFTkSuQmCC"
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
