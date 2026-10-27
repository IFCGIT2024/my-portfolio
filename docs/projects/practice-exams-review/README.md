# Practice exams and assessment validity

A static reading edition of the critical narrative review and position paper,
with its source verification record. Version 1.0, 27 October 2026.

## Published page

https://ifcgit2024.github.io/my-portfolio/docs/projects/practice-exams-review/

The current portfolio deploys the repository root. This page follows the existing
`docs/projects/…` project paths in the root `projects.js` registry. It does not
change the Pages configuration.

## Files

- `index.html`: complete paper, including all 21 references and three tables.
- `audit.html`: complete companion source verification and internal review record.
- `downloads/`: released PDF and Word versions of both documents.
- `paper.md`: text edition for source inspection and suggested changes.
- `style.css` and `reader.js`: reading layout and optional browser controls.
- `build.py`: regenerates both reading pages and Markdown from the released Word documents.
- `assets/`: 1200 × 627 Open Graph title images and a downloadable 1080 × 1080 title card.
- `build_share_images.py`: generates the exact-text title graphics with Pillow.

The browser edition does not change the academic argument. The paper is a critical
narrative review, not a systematic review or an externally peer-reviewed publication.

## Updating

1. Revise and verify the two Word documents in `downloads/`.
2. Export and visually verify matching PDFs under the same base names.
3. Update the version and date in `build.py`.
4. Run `python3 build.py` with `python-docx` and `lxml` installed.
5. Check the reading pages and downloads on desktop and mobile, then commit the full release together.

The build checks that every body paragraph and table cell survives conversion.
Sharing metadata is rendered in the HTML head, with public absolute PNG URLs,
dimensions, image type and alternative text. To regenerate the cards, run
`python3 build_share_images.py` with Pillow and the DejaVu fonts installed.
The square card can also be attached as a photo in a post with the paper URL in
the post text. LinkedIn controls the final link-preview layout, including
compact thumbnails for some ordinary link posts. Its Post Inspector can refresh
the metadata for new shares: https://www.linkedin.com/post-inspector/

The review link opens a new GitHub issue with the version, section and evidence prompts
prefilled; it does not submit a comment automatically. No analytics, external fonts,
third-party scripts or comment widgets are loaded. Text-size preferences are stored
only in the reader’s browser. PDFs and DOCX files are hosted in this repository.
