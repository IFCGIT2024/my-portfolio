# Data sovereignty and Atlantic Canadian space infrastructure

Static reading edition of **Data Sovereignty and Community Participation in
Atlantic Canadian Space Infrastructure**, with its internal source and claim audit.
Working paper, version 1.0, 27 October 2026.

## Published page

https://ifcgit2024.github.io/my-portfolio/docs/projects/atlantic-space-data-sovereignty/

Uses the reading template of the practice-exams review: typography, colours,
section navigation, reading controls, print support, downloads and public review
links. The portfolio deploys the repository root; the card is in root `projects.js`.
No Pages configuration changes are required.

## Release files

- `index.html`: complete paper body, four tables and 34 references.
- `audit.html`: complete internal audit body, including evidence-access limits.
- `downloads/paper.pdf` and `paper.docx`: audited paper, unchanged.
- `downloads/source-audit.pdf` and `source-audit.docx`: final audit, unchanged.
- `downloads/claim-register.xlsx`: 391 substantive review units and 34 sources.
- `paper.md`: generated reading text for inspection and suggested revisions.
- `style.css` and `reader.js`: shared publication template with subheadings and a working-paper notice.
- `build.py`: builds the browser editions from the released Word files.
- `build_share_images.py` and `assets/`: exact-text sharing cards in the same publication style.

The paper proposes a diagnostic lens and future research. It reports no interviews,
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
conversion, and that the paper has 34 references. Publication titles and the date
are presented in the page header. Subheadings remain semantic headings. All four
paper tables have their original captions; audit tables have descriptive captions.

The paper DOCX SHA-256 is
`cc52a48abadb5402356e3a14f53293208c6f976a56e68bd277cd78b406d0b649`.
The audit identifies this same paper file. Keep this identifier synchronized with
future revisions.

Review buttons open prefilled GitHub issue forms; they do not submit comments.
Review comments are public. No external fonts, third-party scripts, analytics,
or embedded comment widgets are loaded. Text-size preferences remain in the
reader's browser. PDF, Word, Excel and sharing-image files are hosted here.
