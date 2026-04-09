# Slide → Questions Prompt Template

## How to Use
1. Attach the PDF to the chat (drag it in or use the paperclip)
2. Copy the prompt below, fill in the `[BRACKETS]`, paste it, and send
3. Copy the JSON output → save as `_output/questions-[topic].json`
4. When all sections of a course are done, copy the file into `docs/projects/[project]/` and update `questions.json`

---

## The Prompt — Copy Everything Below This Line

```
I'm going to give you a PDF of lecture slides. The slides may contain:
- Typed text and diagrams
- Handwritten annotations and notes on the slides

Your job:
1. Read EVERY slide carefully, including all handwritten notes
2. Identify the main topics/sections covered
3. Generate multiple-choice questions that test real understanding (not just memorization)

Course: [e.g. CSCI 1120 – Computer Architecture]
Section/Topic: [e.g. Memory Systems, Module 6]

OUTPUT FORMAT — Return only valid JSON, nothing else, no markdown fences:

{
  "questions": [
    {
      "id": 1,
      "question": "Question text here (Slide X)",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "section": "Section Name"
    }
  ]
}

RULES:
- "id" starts at 1 and increments by 1
- "correct" is the 0-based index of the correct option (0 = first option)
- "section" matches the topic/heading the question belongs to — be consistent
- Always note the slide number in parentheses at the end of the question text, e.g. (Slide 3)
- Include 4 options per question. Distractors should be plausible, not obviously wrong
- Aim for ~5-8 questions per major topic section
- Cover ALL slides — do not skip any content
- If a slide has handwritten annotations, treat that content as equally important as the typed text
- Questions should vary: definitions, applied reasoning, sequencing, comparisons

Do not include any explanation. Return only the JSON.
```

---

## After You Get the JSON

1. Save it as `_output/questions-[topic]-section[N].json`
2. If you processed one chunk of a big slide deck, repeat with the next chunk and give me the **starting id number** to continue from (e.g. "start ids at 47")
3. Once all chunks are done, tell me and I'll merge them and wire up the site

## Continuing from a Previous Chunk

Add this line to the prompt:
```
Start "id" values at [N] (continuing from previous batch).
```
