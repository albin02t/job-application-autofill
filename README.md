# Job Application Autofill Plugin Walkthrough

I have created a Chrome extension that helps you autofill job applications using your resume data and intelligent field matching.

## Features implemented
- **Popup UI**: Save your profile details (Name, Email, Phone, Links).
- **Resume PDF Upload**: Parses text from your uploaded PDF resume using `pdfjs-dist` and puts it into a "Resume Context" field.
- **Intelligent Autofill**: Scans the current page for job application fields and fills them based on fuzzy matching of names, IDs, labels, and synonyms.
- **Context Awareness**: Handles standard fields plus "Cover Letter"/"Additional Info" fields.

## How to Install
1. Open Chrome and go to `chrome://extensions/`.
2. Enable **Developer mode** (toggle in top right).
3. Click **Load unpacked**.
4. Select the directory: `/home/albint/.gemini/antigravity/scratch/job-application-autofill`.

## How to Use
1. Click the extension icon in the toolbar.
2. Fill in your details or upload your Resume PDF to auto-extract text.
3. Click **Save Profile**.
4. Navigate to a job application page (or open `test_form.html` in the project folder).
5. Open the extension popup and click **Autofill Current Page**.

## Verification
- **Unit Tests**: Ran `test_matchers.js` to verify that heuristic logic correctly identifies inputs like "First Name", "Email", and "Additional Info" (Cover Letter) even with variations in naming (e.g., `additional_info` vs `cover_letter`).
- **Manual Test Form**: A `test_form.html` is included in the project to verify autofill on a controlled form.

## Project Structure
- `manifest.json`: Configuration V3.
- `popup.html` / `popup.js`: UI and Resume Parsers.
- `content_script.js`: Logic injected into pages to fill forms.
- `matchers.js`: Library of regex heuristics.
- `lib/`: Contains `pdfjs-dist` library files.
