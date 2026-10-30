# Papers

The Papers hub is at `/my-portfolio/papers/`. Each paper keeps its existing URL.

All paper pages use one template, stylesheet and reading script. Pages show the
title, author, date, working-paper status, paper text, references and PDF/Word
downloads. The home link returns to the Papers hub.

## Update or add a paper

1. Add its metadata to `papers.json`, in the desired display order. Use an ISO
   publication date, a short topic line, a summary and the expected reference count.
2. Put `paper.docx` and `paper.pdf` in the paper folder's `downloads/` directory.
   Word documents use Heading 1 for main sections and end with References.
3. Run `python papers/build.py` from the repository root. This builds the hub,
   reading pages, Markdown copies and sharing images. Dependencies: python-docx,
   Pillow and lxml; the image generator uses DejaVu fonts.
4. Check the generated text against the document, verify local links and inspect
   the layout on desktop and mobile before committing.

`site.css` and `reader.js` are shared by every paper. The hub uses ordinary HTML
links and works without JavaScript. Keep original publication dates when making
presentation changes. Downloaded manuscripts remain the source for the article
text; the build does not edit them.
