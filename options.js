import * as pdfjsLib from './lib/pdf.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = './lib/pdf.worker.js';

document.addEventListener('DOMContentLoaded', async () => {
    const profileListEl = document.getElementById('profileList');
    const addProfileBtn = document.getElementById('addProfileBtn');
    const editorContainer = document.getElementById('editorContainer');
    const welcomeContainer = document.getElementById('welcome');
    
    // Form Inputs
    const inputs = ['profileName', 'fullName', 'email', 'phone', 'linkedin', 'portfolio', 'resumeText', 'coverLetter'];
    const saveBtn = document.getElementById('saveBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const fileInput = document.getElementById('resumeFile');
    const statusDiv = document.getElementById('status');

    let currentProfileId = null;

    // --- State Management ---

    async function getStorage() {
        return new Promise(resolve => {
            chrome.storage.local.get(['profiles', 'activeProfileId'], (result) => {
                resolve({
                    profiles: result.profiles || {},
                    activeProfileId: result.activeProfileId || null
                });
            });
        });
    }

    async function saveStorage(data) {
        return new Promise(resolve => chrome.storage.local.set(data, resolve));
    }

    async function renderProfileList() {
        const { profiles, activeProfileId } = await getStorage();
        profileListEl.innerHTML = '';
        
        Object.keys(profiles).forEach(id => {
            const li = document.createElement('li');
            li.className = 'profile-item';
            if (id === currentProfileId) li.classList.add('active');
            li.textContent = profiles[id].name || 'Untitled Profile';
            li.onclick = () => loadProfileEditor(id);
            profileListEl.appendChild(li);
        });
    }

    async function loadProfileEditor(id) {
        currentProfileId = id;
        const { profiles } = await getStorage();
        const profile = profiles[id];
        
        if (!profile) return;

        welcomeContainer.style.display = 'none';
        editorContainer.style.display = 'block';

        // Fill inputs
        document.getElementById('profileName').value = profile.name || '';
        inputs.forEach(key => {
            if (key !== 'profileName') {
                document.getElementById(key).value = profile.data[key] || '';
            }
        });

        renderProfileList(); // update active state
    }

    async function createProfile() {
        const id = crypto.randomUUID();
        const newProfile = {
            name: 'New Profile',
            data: {}
        };
        
        const { profiles } = await getStorage();
        profiles[id] = newProfile;
        
        await saveStorage({ profiles });
        loadProfileEditor(id);
    }

    async function deleteProfile() {
        if (!currentProfileId) return;
        if (!confirm('Are you sure you want to delete this profile?')) return;

        const { profiles, activeProfileId } = await getStorage();
        delete profiles[currentProfileId];

        // If we deleted the active one, clear it
        let newActiveId = activeProfileId;
        if (activeProfileId === currentProfileId) {
            newActiveId = null;
        }

        await saveStorage({ profiles, activeProfileId: newActiveId });
        
        currentProfileId = null;
        editorContainer.style.display = 'none';
        welcomeContainer.style.display = 'block';
        renderProfileList();
    }

    async function saveCurrentProfile() {
        if (!currentProfileId) return;

        const { profiles } = await getStorage();
        
        const profileName = document.getElementById('profileName').value;
        const data = {};
        
        inputs.forEach(key => {
            if (key !== 'profileName') {
                data[key] = document.getElementById(key).value;
            }
        });

        profiles[currentProfileId] = {
            name: profileName || 'Untitled',
            data: data
        };

        await saveStorage({ profiles });
        showStatus('Profile Saved!', 'success');
        renderProfileList();
    }

    function showStatus(msg, type) {
        statusDiv.textContent = msg;
        statusDiv.style.color = type === 'success' ? '#27ae60' : '#e74c3c';
        setTimeout(() => statusDiv.textContent = '', 3000);
    }

    // --- PDF Parsing ---
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
            showStatus('Resume extracted! Click Save.', 'success');
        } catch (err) {
            console.error('PDF Parse Error:', err);
            showStatus('Failed to parse PDF.', 'error');
        }
    });

    // --- Events ---
    addProfileBtn.addEventListener('click', createProfile);
    saveBtn.addEventListener('click', saveCurrentProfile);
    deleteBtn.addEventListener('click', deleteProfile);

    // Initial Load
    renderProfileList();
});
