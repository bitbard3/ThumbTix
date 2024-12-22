import fs from "fs";
import path from "path";

const addJsExtensionToImports = (filePath) => {
    const content = fs.readFileSync(filePath, "utf8");

    // Regex to match relative imports without .js extensions
    const updatedContent = content.replace(
        /from\s+['"](\..*?)['"]/g,
        (match, p1) => `from "${p1}.js"`
    );

    fs.writeFileSync(filePath, updatedContent, "utf8");
};

const processDirectory = (directory) => {
    const files = fs.readdirSync(directory);

    for (const file of files) {
        const fullPath = path.join(directory, file);

        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith(".js")) {
            addJsExtensionToImports(fullPath);
        }
    }
};

// Start processing from the `dist` folder
processDirectory("./dist");
