// netlify/functions/enhanceResume.js

// Using node-fetch for making API calls in Node.js environment
// Ensure node-fetch is added to dependencies if not available globally in Netlify's runtime
// For Netlify functions, global fetch might be available. If not, uncomment and install:
// const fetch = require("node-fetch"); 

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
    const { parsedText } = JSON.parse(event.body);

    if (!parsedText || typeof parsedText !== 'string' || parsedText.trim() === "") {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing or empty parsedText in request body." }) };
    }

    console.log("[enhanceResume] Received parsedText length:", parsedText.length);

    const primaryPrompt = `Here is the user's extracted resume content:
<EXTRACTED_TEXT>
${parsedText}
</EXTRACTED_TEXT>

Please rewrite and optimize this resume for clarity, impact, and ATS-compatibility.
- Improve bullet strength (use action verbs, quantify where possible).
- Align tone: confident, concise.
- Preserve all certifications and badges.
- Output in Markdown with clear headings (Experience, Skills, Education).`;

    // Fallback prompt if the parsed text is very short or seems problematic
    const fallbackPrompt = `A user provided the following text from their resume: "${parsedText.substring(0,100)}...". Please help generate a basic, professional resume structure in Markdown with headings for Experience, Skills, and Education, including placeholder content if the provided text is insufficient. Focus on a confident and concise tone.`;

    // Choose prompt based on text length or quality (simple example)
    const chosenPrompt = parsedText.length < 50 ? fallbackPrompt : primaryPrompt;
    
    console.log("[enhanceResume] Using prompt:", chosenPrompt.substring(0, 200) + "...");

    // --- Actual LLM API Call --- 
    // Replace with your chosen Hugging Face model and API token
    const HF_API_TOKEN = process.env.HF_API_TOKEN; // Store your Hugging Face API token in Netlify environment variables
    // Example: Mistral-7B-Instruct endpoint. Choose a suitable free model.
    const MODEL_ENDPOINT = process.env.HF_MODEL_ENDPOINT || "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1"; 

    let enhancedMarkdown = "";

    if (!HF_API_TOKEN) {
        console.warn("[enhanceResume] HF_API_TOKEN not set. Using simulated LLM response.");
        // Fallback to simulation if token is not set (for local dev without token or if user hasn't set it up)
        enhancedMarkdown = `# Enhanced Resume (Simulated - HF_API_TOKEN not set)\n\n## Experience\n- Successfully optimized complex operational tasks by an impressive 50% through the strategic implementation of advanced techniques and innovative methodologies.\n- Demonstrated strong leadership by guiding a dynamic team of 5 professionals to deliver a critical project significantly ahead of the scheduled timeline, exceeding all expectations.\n\n## Skills\n- Proficient in modern web technologies including React, Next.js, TailwindCSS, and TypeScript.\n- Expertise in Prompt Engineering for Large Language Models.\n\n## Education\n- Master of Science (M.S.) in Artificial Intelligence, Fictional University, Graduated Summa Cum Laude.`;
    } else {
        console.log(`[enhanceResume] Calling LLM: ${MODEL_ENDPOINT}`);
        const response = await fetch(MODEL_ENDPOINT, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_API_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputs: chosenPrompt,
                parameters: { 
                    max_new_tokens: 1024, // Adjust as needed
                    return_full_text: false, // Often, you only want the generated part
                    temperature: 0.7, // Adjust for creativity vs. determinism
                }
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("[enhanceResume] LLM API request failed:", response.status, errorBody);
            throw new Error(`LLM API request failed with status ${response.status}: ${errorBody}`);
        }

        const result = await response.json();
        
        // The structure of the response can vary by model/API.
        // For many Hugging Face text generation models, it's an array with an object containing `generated_text`.
        if (Array.isArray(result) && result[0] && result[0].generated_text) {
            enhancedMarkdown = result[0].generated_text;
        } else if (typeof result.generated_text === 'string') { // Some might return it directly
             enhancedMarkdown = result.generated_text;
        } else {
            console.error("[enhanceResume] Unexpected LLM API response structure:", result);
            throw new Error("Could not extract enhanced text from LLM response. Unexpected format.");
        }
        console.log("[enhanceResume] LLM response received successfully.");
    }
    // --- End of Actual LLM API Call ---

    if (!enhancedMarkdown || enhancedMarkdown.trim() === "") {
        console.warn("[enhanceResume] LLM returned empty or whitespace-only content.");
        // Fallback if LLM gives empty result
        enhancedMarkdown = "# Resume Enhancement (Fallback)\n\n*Could not generate enhanced content. Please check the input or try again.*";
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ enhancedMarkdown }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      }
    };

  } catch (error) {
    console.error("[enhanceResume] Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "An internal server error occurred during enhancement." }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      }
    };
  }
};

