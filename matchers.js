const Matchers = {
    // Regex patterns and keywords for each field
    patterns: {
        fullName: {
            regex: /name|full[\s_.-]*name|first[\s_.-]*name/i,
            score: 10
        },
        email: {
            regex: /e-?mail/i,
            type: 'email',
            score: 10
        },
        phone: {
            regex: /phone|mobile|cell/i,
            type: 'tel',
            score: 10
        },
        linkedin: {
            regex: /linkedin|linked[\s_.-]*in/i,
            score: 10
        },
        portfolio: {
            regex: /portfolio|github|website|url/i, // General URL matcher might be risky, refine context
            score: 5
        },
        coverLetter: {
            regex: /cover[\s_.-]*letter|additional[\s_.-]*info|hire[\s_.-]*you/i,
            type: 'textarea',
            score: 10
        }
        // resumeText is usually not a direct field, though some might have "paste resume text"
    },

    // Calculate a match score for an input element
    getScore: (element, fieldKey) => {
        let score = 0;
        const matcher = Matchers.patterns[fieldKey];
        if (!matcher) return 0;

        const attributes = ['name', 'id', 'placeholder', 'aria-label'];
        const label = Matchers.findLabel(element);

        // Check attributes
        attributes.forEach(attr => {
            const val = element.getAttribute(attr);
            if (val && matcher.regex.test(val)) {
                score += matcher.score;
            }
        });

        // Check Label
        if (label && matcher.regex.test(label.innerText)) {
            score += matcher.score * 1.5; // Label match is strong
        }

        // Check Input Type
        if (matcher.type && element.type === matcher.type) {
            score += 5;
        }

        return score;
    },

    findLabel: (element) => {
        // 1. explicit 'for' attribute
        if (element.id) {
            const label = document.querySelector(`label[for="${element.id}"]`);
            if (label) return label;
        }
        // 2. parent label
        const parentLabel = element.closest('label');
        if (parentLabel) return parentLabel;

        return null;
    }
};

if (typeof module !== 'undefined') {
    module.exports = Matchers;
}

