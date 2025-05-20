# AI Resume Booster - Prompt Templates

This document outlines the prompt templates used for the LLM enhancement feature in the AI Resume Booster application.

## 1. Primary Enhancement Prompt

This prompt is used when the parsed resume content is substantial enough for a detailed rewrite and optimization.

```text
Here is the user's extracted resume content:
<EXTRACTED_TEXT>
{{parsedText}}
</EXTRACTED_TEXT>

Please rewrite and optimize this resume for clarity, impact, and ATS-compatibility.
- Improve bullet strength (use action verbs, quantify where possible).
- Align tone: confident, concise.
- Preserve all certifications and badges.
- Output in Markdown with clear headings (e.g., ## Experience, ## Skills, ## Education, ## Summary, ## Contact).
- Under Experience, for each role, try to identify and list the Company Name, Position, and Dates. Follow with bullet points for responsibilities and achievements.
- Under Education, for each entry, try to identify and list the Institution, Degree/Study Type, and Dates.
- Ensure the output is well-structured Markdown that can be easily parsed into sections.
```

**Notes on the Primary Prompt:**

*   `{{parsedText}}`: This placeholder is replaced with the actual text extracted from the user's resume.
*   **Clarity, Impact, ATS-Compatibility:** These are the core goals of the enhancement.
*   **Action Verbs & Quantification:** Key instructions for improving bullet points.
*   **Tone:** Specifies the desired professional voice.
*   **Preservation:** Important for ensuring critical information like certifications isn't lost.
*   **Markdown Output & Headings:** Crucial for the subsequent step of converting the LLM's output into a structured JSONResume format. Clear headings like `## Experience`, `## Skills`, `## Education` are requested to aid this parsing.
*   **Structured Sections:** Explicit instructions for Experience and Education sections to guide the LLM towards a more structured output.

## 2. Fallback Plain-Language Prompt

This prompt is used if the initial parsing of the resume yields very little text or if the content seems insufficient for the primary enhancement prompt. It aims to generate a basic structure if nothing else.

```text
A user provided the following text from their resume: "{{parsedTextShortened}}". 

Please help generate a basic, professional resume structure in Markdown format. 
Include standard resume headings like:
- ## Summary
- ## Experience
- ## Skills
- ## Education
- ## Contact

If the provided text is very brief or insufficient to populate these sections, please include placeholder content under each heading to guide the user. 
For example, under Experience, you could suggest: "[Job Title] at [Company Name] (Month Year – Month Year)
- Responsibility/Achievement 1
- Responsibility/Achievement 2"

Focus on a confident and concise tone. The output must be in Markdown.
```

**Notes on the Fallback Prompt:**

*   `{{parsedTextShortened}}`: This placeholder is replaced with a snippet (e.g., the first 100-200 characters) of the limited text extracted from the user's resume.
*   **Basic Structure:** The primary goal is to provide a usable template even with minimal input.
*   **Placeholder Content:** Guides the user on what to fill in if the LLM cannot generate content from the sparse input.
*   **Markdown Output:** Consistency in output format is maintained.

## Considerations for LLM Integration:

*   **Model Choice:** The effectiveness of these prompts can vary based on the LLM used. Models like Mistral-7B-Instruct, Llama, or Gemma are good candidates for free-tier access via Hugging Face Inference API.
*   **Parameters:** When calling the LLM API, parameters such as `max_new_tokens`, `temperature`, and `return_full_text` should be tuned for optimal resume generation. (e.g., `max_new_tokens: 1024-2048`, `temperature: 0.5-0.7`).
*   **Iterative Refinement:** Prompts often require iterative refinement based on observed outputs from the chosen LLM.

