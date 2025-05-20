# AI Resume Booster

## 1. Project Overview and Features

AI Resume Booster is a web service designed to help users enhance their resumes. It ingests a user's LinkedIn URL or an uploaded resume (PDF/DOCX), extracts the content, enhances it using a Large Language Model (LLM) with optimized prompts, formats the improved content into professional resume templates, and allows users to export the final version as a downloadable PDF.

**Key Features:**

*   **Input Flexibility:** Accepts LinkedIn profile URLs or direct file uploads (PDF/DOCX - DOCX parsing is simulated).
*   **Automated Parsing:** Extracts content from resumes using simulated free parsing APIs (actual integration would use Hugging Face Spaces or `pyresparser`). LinkedIn data is simulated based on the LinkedIn Datasource API structure.
*   **LLM-Powered Enhancement:** Leverages a free LLM (e.g., Mistral on Hugging Face) to rewrite and optimize resume content for clarity, impact, and ATS-compatibility.
*   **Multiple Templates:** Offers a selection of three open-source JSONResume themes (`even`, `caffeine`, and `modernist` - modernist currently lacks full CSS styling) for professional formatting.
*   **PDF Export:** Allows users to download their enhanced resume as a PDF, generated client-side using `jsPDF`.
*   **Zero-Budget Focus:** Built entirely using free-tier services and open-source libraries.
*   **Privacy Conscious:** Does not store user data permanently; all processing is done in memory, and uploads are handled ephemerally. A clear privacy notice is displayed on the UI.
*   **User-Friendly Interface:** A single-page application with a clear progress indicator for the enhancement process.

## 2. Tech Stack

*   **Frontend:** Next.js (React framework) with TypeScript, Tailwind CSS.
*   **Serverless Functions:** Netlify Functions (Node.js runtime) for backend logic (parsing, LLM calls, HTML formatting).
*   **Resume Parsing (Simulated):**
    *   Conceptual integration with Hugging Face `resume-parser` Space or `pyresparser`.
    *   LinkedIn data via LinkedIn Datasource API (simulated).
    *   PDF text extraction via `pdftotext` (locally for testing, client-side or serverless for production).
*   **LLM Enhancement (Simulated):**
    *   Calls to a Hugging Face Inference API (e.g., Mistral-7B-Instruct-v0.1).
*   **Resume Formatting:** JSONResume schema, Handlebars for templating.
    *   Themes: `jsonresume-theme-even`, `jsonresume-theme-caffeine`, `jsonresume-theme-modern` (as modernist).
*   **PDF Generation:** `jsPDF` (client-side).
*   **Deployment:** Netlify (for static site hosting and serverless functions).

## 3. Deployment Instructions (Netlify)

1.  **Prerequisites:**
    *   A Netlify account (free tier is sufficient).
    *   A GitHub account (or other Git provider supported by Netlify).
    *   Node.js and npm installed locally for building/testing.

2.  **Setup GitHub Repository:**
    *   Create a new public or private GitHub repository.
    *   Push the entire `/home/ubuntu/ai-resume-booster` project directory to this repository.

3.  **Deploy to Netlify:**
    *   Log in to your Netlify account.
    *   Click on "Add new site" -> "Import an existing project".
    *   Connect to your Git provider (e.g., GitHub) and select the repository you just created.
    *   **Build Settings:**
        *   **Base directory:** (Leave blank or set to the root of your project if your `package.json` and `netlify.toml` are there)
        *   **Build command:** `npm run build` (or `next build` if `next export` is not used for a fully static site with serverless functions).
        *   **Publish directory:** `.next` (for standard Next.js with SSR/ISR/Functions) or `out` (if using `next export` for a purely static site - ensure `output: "export"` is in `next.config.js` if so. The current `netlify.toml` specifies `out`).
        *   **Functions directory:** `netlify/functions` (as configured in `netlify.toml`).
    *   **Environment Variables:**
        *   Click on "Site settings" -> "Build & deploy" -> "Environment".
        *   Add the following environment variables (see section 4 for details):
            *   `HF_API_TOKEN`: Your Hugging Face API token (for LLM calls).
            *   `HF_MODEL_ENDPOINT`: (Optional) The specific Hugging Face model endpoint if different from the default in `enhanceResume.js`.
            *   `LINKEDIN_API_KEY`: (If using a live LinkedIn API - currently simulated, so not strictly needed for the provided code).
    *   Click "Deploy site". Netlify will build and deploy your application.

4.  **Accessing the Site:**
    *   Once deployed, Netlify will provide a public URL (e.g., `your-site-name.netlify.app`).

## 4. Environment Variables

These variables need to be configured in your Netlify deployment environment for the serverless functions to work correctly.

*   **`HF_API_TOKEN`** (Required for LLM Enhancement)
    *   **Description:** Your Hugging Face API token with at least `read` access to make inference requests.
    *   **How to obtain:** Create an account on [Hugging Face](https://huggingface.co), go to your profile settings -> Access Tokens -> New token.
*   **`HF_MODEL_ENDPOINT`** (Optional)
    *   **Description:** The full URL of the Hugging Face Inference API model you want to use for resume enhancement. If not set, the `enhanceResume.js` function defaults to `https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1`.
    *   **Example:** `https://api-inference.huggingface.co/models/google/gemma-7b-it`
*   **`LINKEDIN_API_KEY`** (Conceptual - for a live LinkedIn API)
    *   **Description:** If a live LinkedIn API were used for parsing (instead of the current simulation or Datasource API), its API key would be stored here.
    *   **Note:** The current implementation simulates LinkedIn data parsing and does not require this variable for the provided code to run in its simulated state.

## 5. Project Structure (Key Files & Directories)

```
/home/ubuntu/ai-resume-booster/
├── netlify.toml                # Netlify deployment configuration
├── netlify/
│   └── functions/              # Serverless functions
│       ├── parseResume.js      # Handles resume parsing (simulated)
│       ├── enhanceResume.js    # Handles LLM enhancement (simulated API call)
│       └── formatResumeToHtml/ # Handles HTML generation from JSONResume
│           ├── formatResumeToHtml.js
│           ├── package.json
│           └── modern_theme/   # Locally stored 'modern' theme files
├── public/                     # Static assets
│   └── themes/
│       └── jsonresume-theme-modernist/ # CSS (if found) and template for modern theme
├── src/
│   ├── app/                    # Next.js app router
│   │   └── page.tsx            # Main frontend UI component
│   ├── lib/
│   │   ├── markdownToJsonResume.ts # Converts Markdown to JSONResume format
│   │   └── types.ts            # TypeScript type definitions for JSONResume
│   └── themes/                 # Source for manually added themes (modernist)
│       └── jsonresume-theme-modernist/
├── package.json
├── next.config.js
├── tsconfig.json
└── README.md                   # This file
```

## 6. Prompt Templates

See `PROMPT_TEMPLATES.md` for the detailed prompts used for LLM enhancement.

## 7. Testing Plan

See `TESTING_PLAN.md` for details on how the application was tested.

## 8. Local Development & Testing

1.  **Clone the repository (once on GitHub):**
    `git clone <your-repo-url>`
    `cd ai-resume-booster`
2.  **Install frontend dependencies:**
    `npm install`
3.  **Install serverless function dependencies:**
    Navigate to each function directory that has a `package.json` (e.g., `netlify/functions/formatResumeToHtml`) and run `npm install`.
4.  **Set up Environment Variables (Locally):**
    *   Create a `.env.local` file in the root of the project (`/home/ubuntu/ai-resume-booster/.env.local`).
    *   Add your environment variables (prefix Next.js public vars with `NEXT_PUBLIC_` if accessed client-side, otherwise they are for build/server-side):
        ```
        HF_API_TOKEN=your_hf_token_here
        # HF_MODEL_ENDPOINT=your_model_endpoint_here (optional)
        ```
    *   For Netlify Functions locally, you might need to use `netlify dev` which handles environment variables from the Netlify UI or a local Netlify config.
5.  **Run the development server (Frontend):**
    `npm run dev`
    This will typically start the Next.js app on `http://localhost:3000`.
6.  **Run Netlify Functions Locally (for testing backend):**
    *   Install Netlify CLI: `npm install -g netlify-cli`
    *   Run: `netlify dev`
    This command starts a local server that serves your static site and runs your Netlify Functions, making them accessible at paths like `http://localhost:8888/.netlify/functions/parseResume`.

## 9. Notes on Missing CSS for Modernist Theme

The `jsonresume-theme-modern` (used as "modernist") repository on GitHub does not currently include a `style.css` file. Therefore, when this theme is selected, the resume will be rendered with the HTML structure defined by its Handlebars template but may lack specific styling. For a production environment, you might need to:
*   Find an alternative modern theme that includes CSS.
*   Create custom CSS for the `jsonresume-theme-modern` template.
*   Contribute CSS to the original `jsonresume-theme-modern` repository.


