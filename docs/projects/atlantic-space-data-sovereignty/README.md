# Data sovereignty and Atlantic Canadian space infrastructure

Static reading edition of **Indigenous data sovereignty and the East Coast space sector**, with its internal source and claim audit.
Working paper, version 2.0, 29 October 2026.

## Published page

https://ifcgit2024.github.io/my-portfolio/docs/projects/atlantic-space-data-sovereignty/

Uses the reading template of the practice-exams review: typography, colours,
section navigation, reading controls, print support, downloads and public review
links. The portfolio deploys the repository root; the card is in root `projects.js`.
No Pages configuration changes are required.

## Release files

- `index.html`: complete paper body, two tables and 13 references.
- `audit.html`: complete internal audit body, including evidence-access limits.
- `downloads/paper.pdf` and `paper.docx`: audited paper, unchanged.
- `downloads/source-audit.pdf` and `source-audit.docx`: final audit, unchanged.
- `downloads/claim-register.xlsx`: 47 substantive review units and 13 sources.
- `paper.md`: generated reading text for inspection and suggested revisions.
- `style.css` and `reader.js`: shared publication template with subheadings and a working-paper notice.
- `build.py`: builds the browser editions from the released Word files.
- `build_share_images.py` and `assets/`: exact-text sharing cards in the same publication style.

The paper develops six cumulative questions and proposes future research. It reports no interviews,
community consultation, compliance inspection or outcome evaluation. The source
audit is internal research review, not external peer review. No Mi’kmaw or
institutional approval, exemption or endorsement is claimed. The paper and audit
explain that review requirements remain to be confirmed.

## Updating

1. Revise and audit the Word documents and claim register together.
2. Export and visually verify matching PDFs.
3. Update version/date in `build.py` and sharing cards.
4. Run `python3 build.py` (`python-docx` and `lxml`) and
   `python3 build_share_images.py` (Pillow and DejaVu fonts).
5. Verify desktop/mobile layouts, navigation, reading controls, download bytes,
   references, review links and live deployment. Commit the release together.

The build asserts that every released body paragraph and table cell survives
conversion, and that the paper has 13 references. Publication titles and the date
are presented in the page header. Subheadings remain semantic headings. Both
paper tables retain their captions, as does the audit corrections table.

The paper DOCX SHA-256 is
`d857adf6897f6f38ef67bfe64da37bc2c09138ef989bda501342c8905d56a5c2`.
The audit identifies this same paper file. Keep this identifier synchronized with
future revisions.

Review buttons open prefilled GitHub issue forms; they do not submit comments.
Review comments are public. No external fonts, third-party scripts, analytics,
or embedded comment widgets are loaded. Text-size preferences remain in the
reader's browser. PDF, Word, Excel and sharing-image files are hosted here.

## Second edition

This edition follows a factual timeline, meaning of support, authority, a bounded
data relationship, one existing practice, and the research still required. It
replaces the broader application and system-design survey. Review units are body
paragraphs and nonheader table rows; their counts are not directly comparable with
the first edition's register. The public source history retains the prior release.
Sharing metadata uses the v2 images; v1 images remain as historical assets.
