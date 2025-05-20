// netlify/functions/formatResumeToHtml/formatResumeToHtml.js
const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const _ = require("lodash"); // Dependency for jsonresume-theme-modern
const gravatar = require("gravatar"); // Dependency for jsonresume-theme-modern

// Helper to simulate require for local theme files (modern theme)
const requireLocalTheme = (themePath) => {
  const modulePath = path.resolve(__dirname, themePath, "index.js");
  if (fs.existsSync(modulePath)) {
    // Provide a context similar to what a theme might expect if it uses __dirname for templates
    const themeModule = require(modulePath);
    // Monkey-patch fs.readFileSync if the theme uses it with __dirname relative paths for its template
    // This is a common pattern in JSONResume themes.
    const originalReadFileSync = fs.readFileSync;
    fs.readFileSync = (filePath, options) => {
        if (typeof filePath === 'string' && filePath.startsWith(__dirname)) {
            // If it's already an absolute path within the function, use it
            return originalReadFileSync(filePath, options);
        }
        // Assume relative paths are relative to the theme's directory
        const resolvedPath = path.resolve(__dirname, themePath, filePath.toString());
        return originalReadFileSync(resolvedPath, options);
    };
    const result = themeModule;
    fs.readFileSync = originalReadFileSync; // Restore original fs.readFileSync
    return result;
  }
  throw new Error(`Local theme not found at ${themePath}`);
};

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST" && event.httpMethod !== "OPTIONS") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  try {
    const { resumeJson, themeName } = JSON.parse(event.body);

    if (!resumeJson || typeof resumeJson !== 'object') {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing or invalid resumeJson in request body." }) };
    }
    if (!themeName || typeof themeName !== 'string') {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing or invalid themeName in request body." }) };
    }

    console.log(`[formatResumeToHtml] Received themeName: ${themeName}`);
    let html = "";
    let theme;

    // Provide globals that some themes might expect (like lodash for modern)
    global._ = _;
    global.gravatar = gravatar;
    global.Handlebars = Handlebars;

    switch (themeName.toLowerCase()) {
      case "even":
        theme = require("jsonresume-theme-even");
        html = theme.render(resumeJson);
        break;
      case "caffeine":
        theme = require("jsonresume-theme-caffeine");
        html = theme.render(resumeJson);
        break;
      case "modernist": // User requested 'modernist', we are using 'jsonresume-theme-modern'
      case "modern":
        // For the locally stored 'modern' theme
        // The index.js of jsonresume-theme-modern expects __dirname to resolve resume.template
        theme = requireLocalTheme("./modern_theme");
        html = theme.render(resumeJson);
        // Note: CSS for 'modern' theme is missing from its GitHub repo. HTML will be unstyled or rely on template's inline styles.
        break;
      default:
        return { statusCode: 400, body: JSON.stringify({ error: `Unsupported theme: ${themeName}. Supported themes: even, caffeine, modernist.` }) };
    }

    // Clean up globals if they were set
    delete global._;
    delete global.gravatar;
    delete global.Handlebars;

    if (!html || html.trim() === "") {
        console.warn("[formatResumeToHtml] Theme rendering resulted in empty HTML.");
        html = "<p>Error: Theme failed to render content. Please check resume data and theme compatibility.</p>";
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ html }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    };
  } catch (error) {
    console.error("[formatResumeToHtml] Error:", error);
    // Clean up globals in case of error too
    delete global._;
    delete global.gravatar;
    delete global.Handlebars;
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "An internal server error occurred during HTML formatting." }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    };
  }
};

