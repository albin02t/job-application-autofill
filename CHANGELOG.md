# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-01-06

### Added
- **Core**: Initialized Chrome Extension (Manifest V3).
- **UI**: Popup interface for user profile management (Name, Email, Links).
- **PDF Parsing**: Integrated `pdfjs-dist` to parse uploaded resume PDFs client-side.
- **Autofill**: logic to scan pages and heuristically match fields using regex.
- **Matchers**: `matchers.js` library for fuzzy field matching (First Name, Email, Phone, etc.).
- **Testing**: `test_matchers.js` unit tests and `test_form.html` for manual verification.
