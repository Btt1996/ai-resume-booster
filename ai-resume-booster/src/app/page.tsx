"use client";

import Image from "next/image";
import { useState, ChangeEvent, FormEvent, useRef } from "react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Define types for state
type ProcessingStep = "idle" | "parsing" | "enhancing" | "formatting" | "ready" | "error";
interface ResumeData { // This will be more structured later based on JSONResume
  name?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  experience?: Array<{ title: string; company: string; dates: string; description: string[] }>;
  // Add other fields as needed by JSONResume themes
}

export default function Home() {
  const [linkedinUrl, setLinkedinUrl] = useState<string>("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [processingStep, setProcessingStep] = useState<ProcessingStep>("idle");
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("modernist"); // Default template
  const [resumePreviewHtml, setResumePreviewHtml] = useState<string>("Resume preview will appear here...");
  const [enhancedMarkdown, setEnhancedMarkdown] = useState<string>(""); // To store LLM output
  const [jsonResumeData, setJsonResumeData] = useState<ResumeData | null>(null); // For JSONResume
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);

  const progressMessages: Record<ProcessingStep, string> = {
    idle: "Waiting for input...",
    parsing: "Parsing your resume...",
    enhancing: "Enhancing content with AI...",
    formatting: "Formatting your new resume...",
    ready: "Your enhanced resume is ready!",
    error: "An error occurred."
  };

  const handleLinkedinUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLinkedinUrl(e.target.value);
    if (resumeFile) setResumeFile(null); // Clear file if URL is typed
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
      if (linkedinUrl) setLinkedinUrl(""); // Clear URL if file is selected
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!linkedinUrl && !resumeFile) {
      setErrorMessage("Please provide a LinkedIn URL or upload a resume file.");
      return;
    }

    setProcessingStep("parsing");
    setProgressPercent(25);
    console.log("Starting processing...");
    // Simulate API calls for now
    // TODO: Replace with actual API calls to serverless functions

    // 1. Call parseResume function
    let parsedText = "";
    try {
      if (resumeFile) {
        // Simulate file parsing
        parsedText = `Simulated parsed content from ${resumeFile.name}`;
        console.log(`Parsing file: ${resumeFile.name}`);
      } else if (linkedinUrl) {
        // Simulate LinkedIn scraping
        parsedText = `Simulated scraped content from ${linkedinUrl}`;
        console.log(`Scraping URL: ${linkedinUrl}`);
      }
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
      if (!parsedText) throw new Error("Parsing failed to produce text.");
    } catch (error) {
      console.error("Parsing error:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to parse resume.");
      setProcessingStep("error");
      setProgressPercent(0);
      return;
    }
    
    setProcessingStep("enhancing");
    setProgressPercent(50);
    // 2. Call enhanceResume function
    let markdownOutput = "";
    try {
      // Simulate LLM enhancement
      markdownOutput = `# Enhanced Resume\n\n## Experience\n- Optimized tasks by 50% using advanced techniques.\n- Led a team of 5 to deliver project ahead of schedule.\n\n## Skills\n- React, Next.js, TailwindCSS, TypeScript\n- Prompt Engineering\n\n## Education\n- M.S. in AI, Fictional University`;
      setEnhancedMarkdown(markdownOutput);
      console.log("Enhancement complete. Markdown:", markdownOutput);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
    } catch (error) {
      console.error("Enhancement error:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to enhance resume.");
      setProcessingStep("error");
      setProgressPercent(0);
      return;
    }

    setProcessingStep("formatting");
    setProgressPercent(75);
    // 3. Format Markdown to JSONResume and then to HTML (client-side)
    try {
      // Simulate Markdown to JSONResume conversion
      const tempJsonData: ResumeData = {
        name: "John Doe (Enhanced)",
        experience: [{ title: "Senior Developer", company: "Tech Solutions Inc.", dates: "2020-Present", description: ["Optimized tasks by 50% using advanced techniques.", "Led a team of 5 to deliver project ahead of schedule."] }],
        // ... map other fields from markdownOutput
      };
      setJsonResumeData(tempJsonData);
      // Simulate applying template (this will be more complex with actual themes)
      setResumePreviewHtml(`<div class="p-4 border rounded-md text-sm"><h3>${tempJsonData.name}</h3><p><strong>Experience:</strong> ${tempJsonData.experience?.[0].title} at ${tempJsonData.experience?.[0].company}</p></div>`);
      console.log("Formatting complete. HTML:", resumePreviewHtml);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
    } catch (error) {
      console.error("Formatting error:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to format resume.");
      setProcessingStep("error");
      setProgressPercent(0);
      return;
    }

    setProcessingStep("ready");
    setProgressPercent(100);
    console.log("Process finished!");
  };

  const handleTemplateChange = (templateName: string) => {
    setSelectedTemplate(templateName);
    // TODO: Re-render resumePreviewHtml with the new template using jsonResumeData
    // For now, just a placeholder update
    if (jsonResumeData) {
        setResumePreviewHtml(`<div class="p-4 border rounded-md text-sm theme-${templateName}"><h3>${jsonResumeData.name}</h3><p><strong>Experience:</strong> ${jsonResumeData.experience?.[0].title} at ${jsonResumeData.experience?.[0].company}</p><p><em>Template: ${templateName}</em></p></div>`);
    }
    console.log(`Template changed to: ${templateName}`);
  };

  const handleDownloadPdf = async () => {
    if (!previewRef.current || processingStep !== 'ready') {
        setErrorMessage("Resume is not ready for download or preview area is not available.");
        return;
    }
    setErrorMessage(null);
    try {
        const canvas = await html2canvas(previewRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: 'a4'
        });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 0; // Or some margin
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        pdf.save('ai-enhanced-resume.pdf');
    } catch (error) {
        console.error("Failed to generate PDF:", error);
        setErrorMessage("Failed to generate PDF. Please try again.");
    }
  };

  const getProgressBarWidth = () => {
    if (processingStep === "idle") return "0%";
    if (processingStep === "parsing") return "25%";
    if (processingStep === "enhancing") return "50%";
    if (processingStep === "formatting") return "75%";
    if (processingStep === "ready") return "100%";
    if (processingStep === "error") return "100%"; // Show full bar but in red
    return "0%";
  };

  const getProgressBarColor = () => {
    if (processingStep === "error") return "bg-red-600";
    return "bg-blue-600";
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-12 lg:p-24 bg-gray-100">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-800">AI Resume Booster</h1>
            <p className="text-lg text-gray-600 mt-2">Enhance your resume with the power of AI.</p>
        </div>

        {/* Main Application UI */}
        <form onSubmit={handleSubmit} className="w-full p-6 md:p-8 bg-white shadow-2xl rounded-xl">
          {/* Input Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">1. Provide Your Resume</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile URL</label>
                <input 
                  type="url" 
                  name="linkedinUrl" 
                  id="linkedinUrl" 
                  className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow duration-150 hover:shadow-md"
                  placeholder="https://www.linkedin.com/in/yourprofile" 
                  value={linkedinUrl}
                  onChange={handleLinkedinUrlChange}
                  disabled={processingStep !== 'idle' && processingStep !== 'error'}
                />
              </div>
              <div className="text-center my-2">
                <span className="text-sm text-gray-500">OR</span>
              </div>
              <div>
                <label htmlFor="resumeFile" className="block text-sm font-medium text-gray-700 mb-1">Upload Resume (PDF, DOCX)</label>
                <input 
                  type="file" 
                  name="resumeFile" 
                  id="resumeFile" 
                  accept=".pdf,.docx,.txt" // Added .txt for easier testing initially
                  onChange={handleFileChange}
                  disabled={processingStep !== 'idle' && processingStep !== 'error'}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 transition-colors duration-150 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Submit Button - Placed here for better flow */}
          <div className="mb-8">
            <button 
              type="submit" 
              className={`w-full px-6 py-3 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out transform hover:scale-105 ${ (processingStep !== 'idle' && processingStep !== 'error') ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              disabled={processingStep !== 'idle' && processingStep !== 'error'}
            >
              { (processingStep !== 'idle' && processingStep !== 'error' && processingStep !== 'ready') ? 'Processing...' : 'Boost My Resume!'}
            </button>
          </div>
          
          {errorMessage && (
            <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              <p>{errorMessage}</p>
            </div>
          )}

          {/* Progress UI */}
          {(processingStep !== 'idle' || progressPercent > 0) && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-3">2. Processing Status</h2>
              <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700 overflow-hidden">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ease-out ${getProgressBarColor()}`}
                  style={{ width: getProgressBarWidth() }}
                ></div>
              </div>
              <p className="text-sm text-center text-gray-600 mt-2 font-medium">{progressMessages[processingStep]}</p>
              {processingStep !== 'idle' && processingStep !== 'ready' && processingStep !== 'error' && <p className="text-xs text-center text-gray-500 mt-1">Parsing &rarr; Enhancing &rarr; Formatting &rarr; Ready</p>}
            </div>
          )}

          {/* Template Selection - Only show if processing is complete or in progress towards completion */}
          {(processingStep === 'formatting' || processingStep === 'ready') && jsonResumeData && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">3. Select Template</h2>
              <div className="flex flex-wrap gap-3">
                {["even", "modernist", "caffeine"].map(template => (
                  <button 
                    key={template}
                    type="button"
                    onClick={() => handleTemplateChange(template)}
                    className={`px-5 py-2.5 border rounded-lg shadow-sm text-sm font-medium transition-all duration-150 ease-in-out hover:shadow-md ${selectedTemplate === template ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-400 ring-offset-1' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                  >
                    {template.charAt(0).toUpperCase() + template.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Resume Preview Area - Only show if processing is complete or in progress towards completion */}
          {(processingStep === 'formatting' || processingStep === 'ready') && jsonResumeData && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">4. Preview Your Enhanced Resume</h2>
              <div ref={previewRef} className="w-full min-h-[20rem] border border-gray-300 rounded-lg p-4 md:p-6 bg-white shadow-inner overflow-y-auto">
                {/* This will be replaced by actual themed HTML later */}
                <div dangerouslySetInnerHTML={{ __html: resumePreviewHtml }} />
              </div>
            </div>
          )}

          {/* Download PDF Button - Only show if ready */}
          {processingStep === 'ready' && jsonResumeData && (
            <div className="text-center mb-8">
              <button 
                type="button"
                onClick={handleDownloadPdf}
                className="px-8 py-3.5 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 hover:shadow-lg transition-all duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Download PDF
              </button>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">Privacy Notice: We delete your uploads immediately after processing. Your data is not stored.</p>
          </div>

        </form>
        
        {/* Vercel/Next.js branding - can be removed or kept minimal */}
        <div className="mt-16 text-center">
            <a
                href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
                Powered by Next.js & Vercel
                <Image
                src="/vercel.svg"
                alt="Vercel Logo"
                className="dark:invert ml-2"
                width={70}
                height={16}
                />
            </a>
        </div>
      </div>
    </main>
  );
}

