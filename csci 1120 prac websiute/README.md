# Quiz System Documentation

## Overview
This is a modular, easy-to-update practice exam system for CSCI 1120 Module 4.

## File Structure

```
├── index.html          # Main quiz interface
├── style.css          # Styling and layout
├── script.js          # Quiz logic and functionality
├── questions.json     # All questions (easy to edit!)
└── README.md          # This file
```

## How to Update Questions

### Adding a New Question
Edit `questions.json` and add a new question object to the `questions` array:

```json
{
  "id": 116,
  "question": "Your question text here?",
  "options": [
    "First option",
    "Second option",
    "Third option",
    "Fourth option"
  ],
  "correct": 0,
  "section": "Fetch, Decode, Execute"
}
```

**Field Descriptions:**
- `id`: Unique identifier (increment from last)
- `question`: The question text
- `options`: Array of 4 answer choices (A, B, C, D)
- `correct`: Index of correct answer (0=A, 1=B, 2=C, 3=D)
- `section`: Category name (groups questions by topic)

### Editing an Existing Question
Simply modify the question text, options, or answer in the JSON file.

### Example JSON Structure
```json
{
  "questions": [
    {
      "id": 1,
      "question": "What is a question?",
      "options": ["Answer A", "Answer B", "Answer C", "Answer D"],
      "correct": 1,
      "section": "Assembly Instructions"
    }
  ]
}
```

## Features

### Quiz Features
- ✅ Randomized question order (different each time)
- ✅ One question per screen
- ✅ Answer selection with visual feedback
- ✅ Previous/Next navigation
- ✅ Cannot proceed without answering
- ✅ Real-time progress bar

### Results Page
- ✅ Final score display
- ✅ Percentage calculation
- ✅ Section-by-section breakdown
- ✅ Retake quiz button

### Responsive Design
- ✅ Works on desktop, tablet, and mobile
- ✅ Touch-friendly buttons
- ✅ Adaptive layouts

## Browser Compatibility
- Chrome/Edge (modern versions)
- Firefox (modern versions)
- Safari (modern versions)
- Any browser with ES6 support

## Colors & Customization

Edit variables in `style.css`:
```css
:root {
    --primary-color: #2563eb;        /* Button/accent color */
    --success-color: #16a34a;        /* Correct answer color */
    --danger-color: #dc2626;         /* Wrong answer color */
}
```

## How It Works

1. **Load**: `script.js` fetches `questions.json`
2. **Shuffle**: Fisher-Yates algorithm randomizes question order
3. **Display**: Shows one question at a time
4. **Track**: Stores user answers in array
5. **Score**: Calculates final score and section breakdown
6. **Show Results**: Displays comprehensive results page

## Tips

- Keep question text concise but clear
- Use consistent formatting in options
- Group related questions in same section for analytics
- The JSON file is the single source of truth - no hardcoding in code

## Future Enhancements

Possible additions (no changes needed to core structure):
- Save results to localStorage (persist between sessions)
- Timer/countdown feature
- Question review screen before final submission
- Difficulty ratings
- Explanations for answers

## Support

If `questions.json` doesn't load:
1. Check file is in same directory as `index.html`
2. Verify JSON syntax (use jsonlint.com)
3. Check browser console for errors (F12)
