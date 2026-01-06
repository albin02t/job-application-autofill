document.addEventListener('DOMContentLoaded', async () => {
    const profileSelect = document.getElementById('profileSelect');
    const autofillBtn = document.getElementById('autofillBtn');
    const manageBtn = document.getElementById('manageBtn');
    const statusDiv = document.getElementById('status');

    // Load Profiles
    chrome.storage.local.get(['profiles', 'activeProfileId'], (result) => {
        const profiles = result.profiles || {};
        const activeId = result.activeProfileId;

        profileSelect.innerHTML = '';

        const keys = Object.keys(profiles);
        if (keys.length === 0) {
            const opt = document.createElement('option');
            opt.text = "No profiles found";
            profileSelect.add(opt);
            autofillBtn.disabled = true;
        } else {
            keys.forEach(id => {
                const opt = document.createElement('option');
                opt.value = id;
                opt.text = profiles[id].name;
                if (id === activeId) opt.selected = true;
                profileSelect.add(opt);
            });
            autofillBtn.disabled = false;
        }
    });

    // Save Active Profile on Change
    profileSelect.addEventListener('change', () => {
        const selectedId = profileSelect.value;
        if (selectedId) {
            chrome.storage.local.set({ activeProfileId: selectedId });
        }
    });

    // Open Options Page
    manageBtn.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });

    // Autofill
    autofillBtn.addEventListener('click', async () => {
        const selectedId = profileSelect.value;
        if (!selectedId) return;

        // Get fresh data
        chrome.storage.local.get(['profiles'], async (result) => {
            const profile = result.profiles ? result.profiles[selectedId] : null;
            if (!profile) {
                statusDiv.textContent = "Error loading profile";
                return;
            }

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab) {
                chrome.tabs.sendMessage(tab.id, {
                    action: 'AUTOFILL',
                    data: profile.data
                }).then(() => {
                    statusDiv.textContent = "Autofill sent!";
                    statusDiv.style.color = 'green';
                }).catch(err => {
                    statusDiv.textContent = "Reload page first!";
                    statusDiv.style.color = 'red';
                });
            }
        });
    });
});
