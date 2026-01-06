const Matchers = require('./matchers.js');

// Mock Element
class MockElement {
    constructor(tag, attributes = {}, innerText = '') {
        this.tagName = tag.toUpperCase();
        this.attributes = attributes;
        this.innerText = innerText;
        this.type = attributes.type || 'text';
        this.id = attributes.id;
    }

    getAttribute(name) {
        return this.attributes[name] || null;
    }

    closest(selector) {
        return null; // Simplify for now
    }
}

// Mock document for findLabel (simplified)
Matchers.findLabel = (element) => {
    // Mock label finding logic for test
    if (element.attributes['aria-label']) {
        return { innerText: element.attributes['aria-label'] };
    }
    return null;
};

function runTests() {
    const tests = [
        {
            field: 'fullName',
            element: new MockElement('input', { name: 'first_name', id: 'fname' }),
            expectedScore: 10,
            desc: 'First Name input should match fullName'
        },
        {
            field: 'email',
            element: new MockElement('input', { type: 'email', name: 'user_email' }),
            expectedScore: 25, // 10 (regex) + 10 (regex second attr?) + 5 (type). Wait, getScore sums matches.
            // logic: loop attributes. name='user_email' matches /email/ (+10). type='email' matches type (+5).
            desc: 'Email input type and name'
        },
        {
            field: 'startYear', // non-existent
            element: new MockElement('input', { name: 'year' }),
            expectedScore: 0,
            desc: 'Random field match'
        },
        {
            field: 'coverLetter',
            element: new MockElement('textarea', { name: 'additional_info' }),
            expectedScore: 10, // regex matches
            desc: 'Additional info matches cover letter'
        }
    ];

    let passed = 0;
    tests.forEach(t => {
        const score = Matchers.getScore(t.element, t.field);
        if (score >= 10 === (t.expectedScore >= 10)) { // rough check for match/no-match
            console.log(`PASS: ${t.desc} (Score: ${score})`);
            passed++;
        } else {
            console.error(`FAIL: ${t.desc} (Score: ${score}, Expected ~${t.expectedScore})`);
        }
    });

    console.log(`\nTests Passed: ${passed}/${tests.length}`);
}

runTests();
