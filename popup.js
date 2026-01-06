import * as pdfjsLib from './lib/pdf.js';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = './lib/pdf.worker.js';

document.addEventListener('DOMContentLoaded', async () => {
    const saveBtn = document.getElementById('saveBtn');
    const autofillBtn = document.getElementById('autofillBtn');
    const fileInput = document.getElementById('resumeFile');
    const statusDiv = document.getElementById('status');

    // Fields to save/load
    const fields = ['fullName', 'email', 'phone', 'linkedin', 'portfolio', 'resumeText', 'coverLetter'];

    // Load saved data
    chrome.storage.local.get(fields, (result) => {
        fields.forEach(field => {
            if (result[field]) {
                document.getElementById(field).value = result[field];
            }
        });
    });

    // Save Profile
    saveBtn.addEventListener('click', () => {
        const data = {};
        fields.forEach(field => {
            data[field] = document.getElementById(field).value;
        });

        chrome.storage.local.set(data, () => {
            showStatus('Profile saved!', 'success');
        });
    });

    // Autofill Action
    autofillBtn.addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
            // Collect current data to send fresh
            const data = {};
            fields.forEach(field => {
                data[field] = document.getElementById(field).value;
            });

            // Send message to content script
            chrome.tabs.sendMessage(tab.id, {
                action: 'AUTOFILL',
                data: data
            }).catch(err => {
                showStatus('Reload the page first!', 'error');
                console.error(err);
            });
        }
    });

    // PDF Parsing
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            showStatus('Please upload a PDF file.', 'error');
            return;
        }

        showStatus('Parsing PDF...', 'info');

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + '\n\n';
            }

            document.getElementById('resumeText').value = fullText.trim();
            showStatus('Resume text extracted!', 'success');
        } catch (err) {
            console.error('PDF Parse Error:', err);
            showStatus('Failed to parse PDF.', 'error');
        }
    });

    function showStatus(msg, type) {
        statusDiv.textContent = msg;
        statusDiv.style.color = type === 'error' ? '#e74c3c' : '#27ae60';
        setTimeout(() => {
            statusDiv.textContent = '';
        }, 3000);
    }
});
