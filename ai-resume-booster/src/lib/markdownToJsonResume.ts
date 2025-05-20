// src/lib/markdownToJsonResume.ts
import { marked } from "marked";
import type { JsonResume, Basics, Work, EducationItem, SkillItem, Location, Profile } from "./types";

// Helper to sanitize and extract text from tokens
const extractText = (tokens: marked.Token[] | undefined): string => {
  if (!tokens) return "";
  return tokens.map(token => token.raw).join("").trim();
};

export function parseMarkdownToJSONResume(markdown: string): JsonResume {
  const tokens = marked.lexer(markdown);
  const resume: JsonResume = {
    basics: { name: "", label: "", email: "", phone: "", url: "", summary: "", location: {}, profiles: [] },
    work: [],
    education: [],
    skills: [],
  };

  let currentSection: keyof JsonResume | null = null;
  let currentWorkItem: Work | null = null;
  let currentEducationItem: EducationItem | null = null;

  for (const token of tokens) {
    if (token.type === "heading") {
      const sectionTitle = token.text.toLowerCase();
      currentWorkItem = null; // Reset item context when section changes
      currentEducationItem = null;

      if (sectionTitle.includes("experience") || sectionTitle.includes("work")) {
        currentSection = "work";
      } else if (sectionTitle.includes("education")) {
        currentSection = "education";
      } else if (sectionTitle.includes("skills") || sectionTitle.includes("technical skills")) {
        currentSection = "skills";
      } else if (sectionTitle.includes("summary") || sectionTitle.includes("profile")) {
        currentSection = "basics"; // Summary goes into basics.summary
      } else if (sectionTitle.includes("contact") || sectionTitle.includes("personal details")) {
        currentSection = "basics"; // Contact info also part of basics
      } else {
        currentSection = null;
      }
    } else if (currentSection === "basics") {
      if (token.type === "paragraph" || token.type === "text") {
        const text = token.raw.trim();
        if (!resume.basics) resume.basics = {};
        // Heuristic parsing for basics
        if (text.toLowerCase().startsWith("email:")) resume.basics.email = text.substring(6).trim();
        else if (text.toLowerCase().startsWith("phone:")) resume.basics.phone = text.substring(6).trim();
        else if (text.toLowerCase().startsWith("linkedin:") || text.toLowerCase().startsWith("url:")) {
            const url = text.substring(text.indexOf(":") + 1).trim();
            resume.basics.url = resume.basics.url || url; // Prefer first URL as main, or specific if linkedin
            if (url.includes("linkedin.com")) {
                if (!resume.basics.profiles) resume.basics.profiles = [];
                resume.basics.profiles.push({ network: "LinkedIn", username: url.split("/").pop() || "", url: url });
            }
        } else if (text.toLowerCase().startsWith("name:")) {
            resume.basics.name = text.substring(5).trim();
        } else if (currentSection === "basics" && (token.type === "paragraph" || token.type === "text")) {
            // If it's a general paragraph under basics, assume it's part of summary or name/label if not yet set
            if (!resume.basics.name && text.split(" ").length < 5) { // Likely a name
                resume.basics.name = text;
            } else if (!resume.basics.label && text.split(" ").length < 7 && text.split(" ").length > 2) { // Likely a label/title
                resume.basics.label = text;
            } else {
                resume.basics.summary = (resume.basics.summary ? resume.basics.summary + "\n" : "") + text;
            }
        }
      }
    } else if (currentSection === "work") {
      if (token.type === "paragraph" || token.type === "text") {
        const text = token.raw.trim();
        // Try to detect new work item (e.g., "Job Title at Company Name (Date Range)")
        const workHeaderMatch = text.match(/^(.+?)\s+at\s+(.+?)(?:\s+\((.+?)\))?$/i);
        if (workHeaderMatch) {
          if (currentWorkItem) resume.work?.push(currentWorkItem);
          currentWorkItem = {
            position: workHeaderMatch[1].trim(),
            name: workHeaderMatch[2].trim(), // Company name
            company: workHeaderMatch[2].trim(),
            startDate: workHeaderMatch[3]?.split("-")[0]?.trim() || "",
            endDate: workHeaderMatch[3]?.split("-")[1]?.trim() || "",
            highlights: []
          };
        } else if (currentWorkItem && text.length > 0) {
          // If not a header, and we are in a work item, assume it's a summary for that role (less common in Markdown resumes)
          // currentWorkItem.summary = (currentWorkItem.summary ? currentWorkItem.summary + "\n" : "") + text;
        }
      } else if (token.type === "list" && currentWorkItem) {
        if (!currentWorkItem.highlights) currentWorkItem.highlights = [];
        for (const item of token.items) {
          currentWorkItem.highlights.push(extractText(item.tokens));
        }
      }
    } else if (currentSection === "education") {
      if (token.type === "paragraph" || token.type === "text") {
        const text = token.raw.trim();
        // Try to detect new education item (e.g., "Degree, Institution (Date Range)")
        const eduHeaderMatch = text.match(/^(.+?),\s+(.+?)(?:\s+\((.+?)\))?$/i);
        if (eduHeaderMatch) {
          if (currentEducationItem) resume.education?.push(currentEducationItem);
          currentEducationItem = {
            studyType: eduHeaderMatch[1].trim(), // Degree
            institution: eduHeaderMatch[2].trim(),
            area: "", // Could try to infer or leave for LLM to specify
            startDate: eduHeaderMatch[3]?.split("-")[0]?.trim() || "",
            endDate: eduHeaderMatch[3]?.split("-")[1]?.trim() || "",
          };
        } else if (currentEducationItem && text.length > 0) {
            // Add to courses or as a general note if not a header
            if (!currentEducationItem.courses) currentEducationItem.courses = [];
            currentEducationItem.courses.push(text);
        }
      } else if (token.type === "list" && currentEducationItem) {
        if (!currentEducationItem.courses) currentEducationItem.courses = [];
        for (const item of token.items) {
            currentEducationItem.courses.push(extractText(item.tokens));
        }
      }
    } else if (currentSection === "skills") {
      if (token.type === "list") {
        if (!resume.skills) resume.skills = [];
        for (const item of token.items) {
          const skillText = extractText(item.tokens);
          // Skills can be comma-separated or one per bullet. If comma-separated in one bullet:
          skillText.split(",").forEach(s => {
            if (s.trim()) resume.skills?.push({ name: s.trim(), keywords: [] });
          });
        }
      } else if (token.type === "paragraph" || token.type === "text") {
        // Handle comma-separated skills in a paragraph
        if (!resume.skills) resume.skills = [];
        const skillsFromPara = token.raw.split(",").map(s => s.trim()).filter(s => s.length > 0);
        skillsFromPara.forEach(s => {
            resume.skills?.push({ name: s, keywords: [] });
        });
      }
    }
  }

  // Push the last collected item if any
  if (currentWorkItem) resume.work?.push(currentWorkItem);
  if (currentEducationItem) resume.education?.push(currentEducationItem);
  
  // Basic info might be the first non-heading paragraph if not explicitly sectioned
  if (!resume.basics?.name && !resume.basics?.summary && tokens.length > 0) {
    if (tokens[0].type === "paragraph" || tokens[0].type === "text") {
        const firstPara = tokens[0].raw.trim();
        // Simple heuristic: if it has multiple lines or many words, it's a summary.
        // If it's short, it might be a name or title.
        if (firstPara.split("\n").length > 1 || firstPara.split(" ").length > 10) {
            if (!resume.basics) resume.basics = {};
            resume.basics.summary = firstPara;
        } else if (!resume.basics.name) {
            if (!resume.basics) resume.basics = {};
            resume.basics.name = firstPara;
        }
    }
  }

  return resume;
}

