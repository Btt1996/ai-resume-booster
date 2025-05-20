// netlify/functions/parseResume.js

// Placeholder for actual parsing libraries and API clients
// const fetch = require("node-fetch"); // Or use a global fetch if available in Netlify's Node.js runtime
// const mammoth = require("mammoth"); // For DOCX
// For PDF parsing, if doing server-side, might need pdf-parse or similar

// Helper function to extract LinkedIn username from URL
const getLinkedInUsername = (url) => {
  try {
    const path = new URL(url).pathname;
    const parts = path.split("/").filter(part => part.length > 0);
    if (parts[0] === "in" && parts[1]) {
      return parts[1];
    }
    return null;
  } catch (e) {
    console.error("Invalid LinkedIn URL format:", url, e);
    return null;
  }
};

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST" && event.httpMethod !== "OPTIONS") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // Handle OPTIONS request for CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Adjust for production
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      },
      body: ""
    };
  }

  try {
    const { type, data } = JSON.parse(event.body);
    let parsedText = "";

    if (!type || !data) {
        return { statusCode: 400, body: JSON.stringify({ error: "Missing type or data in request body." }) };
    }

    console.log(`[parseResume] Received type: ${type}`);

    if (type === "url") {
      const linkedinUrl = data;
      const username = getLinkedInUsername(linkedinUrl);

      if (!username) {
        return { statusCode: 400, body: JSON.stringify({ error: "Invalid LinkedIn URL format. Could not extract username." }) };
      }
      
      console.log(`[parseResume] Extracted LinkedIn username: ${username}`);
      
      // TODO: Integrate actual LinkedIn Datasource API call (LinkedIn/get_user_profile_by_username)
      // This would typically involve: 
      // 1. Making this Netlify function a Python function to use the provided ApiClient.
      // 2. Or, calling a separate Python helper function/service that wraps the ApiClient.
      // For now, simulating the API call and response formatting.
      
      // Simulated response from LinkedIn/get_user_profile_by_username
      const simulatedLinkedInData = {
        success: true,
        message: "Profile data retrieved successfully",
        data: {
          // ... (full structure as per API doc, but we only need a subset for text)
          author: { // Assuming profile data is under an 'author'-like key or similar top-level keys
            firstName: "John",
            lastName: "Doe",
            headline: "Senior Software Engineer at Tech Corp",
            // ... other fields like experience, skills, education would be here
          },
          experience: [
            { title: "Senior Software Engineer", company: "Tech Corp", duration: "2020-Present", description: "Developed cool stuff." },
            { title: "Software Engineer", company: "Old Corp", duration: "2018-2020", description: "Developed other stuff." }
          ],
          skills: [{ name: "JavaScript" }, { name: "React" }, { name: "Node.js" }],
          education: [{ school: "University of Example", degree: "B.S. Computer Science", duration: "2014-2018" }]
          // ... etc.
        }
      };

      if (simulatedLinkedInData.success && simulatedLinkedInData.data) {
        const profile = simulatedLinkedInData.data.author || {}; // Adjust based on actual API response structure
        const experiences = simulatedLinkedInData.data.experience || [];
        const skills = simulatedLinkedInData.data.skills || [];
        const education = simulatedLinkedInData.data.education || [];

        parsedText += `Name: ${profile.firstName || ""} ${profile.lastName || ""}\n`;
        parsedText += `Headline: ${profile.headline || ""}\n\n`;
        
        if (experiences.length > 0) {
          parsedText += "Experience:\n";
          experiences.forEach(exp => {
            parsedText += `- ${exp.title} at ${exp.company} (${exp.duration || ""})\n`;
            if(exp.description) parsedText += `  ${exp.description}\n`;
          });
          parsedText += "\n";
        }

        if (skills.length > 0) {
          parsedText += "Skills:\n";
          parsedText += skills.map(skill => skill.name).join(", ") + "\n\n";
        }

        if (education.length > 0) {
          parsedText += "Education:\n";
          education.forEach(edu => {
            parsedText += `- ${edu.degree || ""} at ${edu.school} (${edu.duration || ""})\n`;
          });
          parsedText += "\n";
        }
        console.log(`[parseResume] Simulated parsing for LinkedIn username: ${username}`);
      } else {
        parsedText = `Could not retrieve profile for ${username}. (Simulated error)`;
        console.warn(`[parseResume] Simulated LinkedIn API call failed for ${username}`);
      }

    } else if (type === "file") {
      const { fileName, fileContentB64 } = data;
      if (!fileName || !fileContentB64) {
        return { statusCode: 400, body: JSON.stringify({ error: "Missing fileName or fileContentB64 for file type." }) };
      }
      
      const fileBuffer = Buffer.from(fileContentB64, "base64");
      console.log(`[parseResume] Received file: ${fileName}, size: ${fileBuffer.length} bytes`);

      if (fileName.endsWith(".pdf")) {
        // TODO: Implement PDF parsing (e.g., Hugging Face Space API or pdf-parse library)
        parsedText = `Simulated parsed PDF content from ${fileName}`;
        console.log(`[parseResume] Simulating PDF parsing for: ${fileName}`);
      } else if (fileName.endsWith(".docx")) {
        // TODO: Implement DOCX parsing (e.g., mammoth.js)
        parsedText = `Simulated parsed DOCX content from ${fileName}`;
        console.log(`[parseResume] Simulating DOCX parsing for: ${fileName}`);
      } else if (fileName.endsWith(".txt")) {
        parsedText = fileBuffer.toString("utf8");
        console.log(`[parseResume] Parsed TXT file: ${fileName}`);
      } else {
        return { statusCode: 400, body: JSON.stringify({ error: "Unsupported file type. Please use PDF, DOCX, or TXT." }) };
      }
    } else {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid type specified. Use 'url' or 'file'." }) };
    }

    if (!parsedText) {
        console.warn("[parseResume] Parsing resulted in empty text for the given input.");
        // It might be valid for an empty file, but for a URL or non-empty file, it's an issue.
        // Consider returning an error or specific message if critical.
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ parsedText }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      }
    };

  } catch (error) {
    console.error("[parseResume] Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "An internal server error occurred during parsing." }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      }
    };
  }
};

