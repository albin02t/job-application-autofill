chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'AUTOFILL') {
        autofill(request.data);
        sendResponse({ status: 'done' });
    }
});

function autofill(profileData) {
    const inputs = document.querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
        if (!isVisible(input)) return;
        if (input.type === 'hidden' || input.type === 'submit' || input.type === 'button') return;
        if (input.value && input.value.length > 0) {
            // Optional: skip if already filled? For now, we might want to override or leave it. 
            // Let's leave it to avoid messing up what user typed, unless it's a very strong match?
            // Simple logic: overwrite empty only? Or overwrite all? 
            // User clicked "Autofill", they expect action. Let's overwrite.
        }

        let bestField = null;
        let bestScore = 0;

        // Find best match for this input among all profile fields
        Object.keys(profileData).forEach(fieldKey => {
            if (!profileData[fieldKey]) return; // Skip empty profile data

            const score = Matchers.getScore(input, fieldKey);
            if (score > bestScore) {
                bestScore = score;
                bestField = fieldKey;
            }
        });

        // Threshold
        if (bestScore >= 10 && bestField) {
            console.log(`Autofilling ${bestField} into`, input);
            setValue(input, profileData[bestField]);
            highlight(input);
        }
    });
}

function setValue(element, value) {
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));
}

function isVisible(element) {
    return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
}

function highlight(element) {
    const originalBorder = element.style.border;
    element.style.border = '2px solid #2ecc71';
    element.style.transition = 'border 0.5s';
    setTimeout(() => {
        element.style.border = originalBorder;
    }, 2000);
}
