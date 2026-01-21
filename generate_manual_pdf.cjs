
const markdownpdf = require("markdown-pdf");
const fs = require("fs");
const path = require("path");

const mdPath = "/Users/sanjayvarma/.gemini/antigravity/brain/faa94947-d629-4a0f-a53c-b62d89171a74/user_manual.md";
const pdfPath = "/Users/sanjayvarma/.gemini/antigravity/brain/faa94947-d629-4a0f-a53c-b62d89171a74/ArmSim_User_Manual.pdf";

// Custom CSS to make the image fit
const cssPath = path.join(__dirname, "pdf-style.css");
const cssContent = "img { max-width: 100%; } body { font-family: Helvetica, Arial, sans-serif; }";
fs.writeFileSync(cssPath, cssContent);

markdownpdf({
    cssPath: cssPath
})
    .from(mdPath)
    .to(pdfPath, function () {
        console.log("PDF created at:", pdfPath);
    });
