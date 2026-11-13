# Mizel Cluett

Research, open courses, study tools, and experiments. This repository collects the things I’m writing, building, and learning from.

**[Visit the portfolio](https://ifcgit2024.github.io/my-portfolio/)** · [LinkedIn](https://ca.linkedin.com/in/mizel-doyle-bedwell-cluett-battiste-144895158) · [Previous portfolio](https://ifcgit2024.github.io/my-portfolio/archive/portfolio-2026-11-01/index.html)

## Explore the work

### Research

| Project | About | Source |
| --- | --- | --- |
| [Indigenous data sovereignty & the space sector](https://ifcgit2024.github.io/my-portfolio/docs/projects/atlantic-space-data-sovereignty/) | A working paper on Indigenous authority over data and the East Coast space sector | [Project](docs/projects/atlantic-space-data-sovereignty/) |
| [Practice exams & assessment validity](https://ifcgit2024.github.io/my-portfolio/docs/projects/practice-exams-review/) | A narrative review of practice exams in computer science education | [Project](docs/projects/practice-exams-review/) |

The [papers collection](https://ifcgit2024.github.io/my-portfolio/papers/) includes the online papers and manuscript downloads.

### Courses

| Project | About | Source |
| --- | --- | --- |
| [C → Assembly Lab](https://ifcgit2024.github.io/my-portfolio/docs/projects/assembly-lab/) | A course from first concepts to C translation, memory, bit operations, and function calls | [Project & tests](docs/projects/assembly-lab/) |
| [Context-Free Languages Lab](https://ifcgit2024.github.io/my-portfolio/docs/projects/cfl-lab/) | A guided course in grammars, parsing, pushdown automata and pumping proofs, with interactive traces | [Project & tests](docs/projects/cfl-lab/) |
| [Discrete mathematics for CS](https://ifcgit2024.github.io/my-portfolio/docs/projects/discrete-math/) | 30 classes connecting formal proof and Java | [Project](docs/projects/discrete-math/) |
| [DataGuard Academy](https://ifcgit2024.github.io/my-portfolio/bank-interview-prep/) | Data classification, security, SQL, Python, and interview preparation | [Project](bank-interview-prep/) |

### Study & practice

| Project | Focus | Source |
| --- | --- | --- |
| [Fall 2026 practice hub](https://ifcgit2024.github.io/my-portfolio/docs/projects/fall-2026/) | CSCI 2115, 2122, 2134, and 2141 | [Project](docs/projects/fall-2026/) |
| [CSCI 2110](https://ifcgit2024.github.io/my-portfolio/csci-2110-practice-site/) | Data structures | [Project](csci-2110-practice-site/) |
| [CSCI 1120](https://ifcgit2024.github.io/my-portfolio/docs/projects/csci-1120-prep/) | Introductory computer science | [Project](docs/projects/csci-1120-prep/) |
| [Proof practice](https://ifcgit2024.github.io/my-portfolio/docs/projects/proofs/) | Constructing mathematical proofs | [Project](docs/projects/proofs/) |
| [CALC 1000](https://ifcgit2024.github.io/my-portfolio/docs/projects/calc-1000-prep/) | Derivatives and differentiation rules | [Project](docs/projects/calc-1000-prep/) |

### Tools & experiments

| Project | About | Source |
| --- | --- | --- |
| [Canadian funding database](https://ifcgit2024.github.io/my-portfolio/canadian-funding-database/funding-portal.html) | A searchable June 2026 snapshot of housing, retrofit, and climate funding records; works on GitHub Pages | [Data & export instructions](canadian-funding-database/) |
| [PDF too big](https://ifcgit2024.github.io/my-portfolio/pdf-splitter/) | Split PDFs in the browser | [Project](pdf-splitter/) |
| [Simply the Best House-Sitters](https://ifcgit2024.github.io/my-portfolio/docs/projects/simply-the-best-house-sitters/) | A website design with a demo quote form | [Static demo](docs/projects/simply-the-best-house-sitters/) |

### Just for fun

| Project | About | Source |
| --- | --- | --- |
| [Little Room](https://ifcgit2024.github.io/my-portfolio/docs/projects/little-room/) | A cozy room planner with feng shui-inspired layout suggestions | [Project](docs/projects/little-room/) |
| [Polymarket Lab](https://ifcgit2024.github.io/my-portfolio/polymarket-dashboard/) | Paper trading and API experiments with virtual funds; market data depends on external feeds | [Dashboard](polymarket-dashboard/) |
| [RE Investment Analyzer](https://ifcgit2024.github.io/my-portfolio/docs/projects/re-analyzer/) | A browser-based property scenario calculator | [App & formula tests](docs/projects/re-analyzer/) |

## Repository map

| Location | Purpose |
| --- | --- |
| `index.html`, `assets/portfolio.css` | Current landing page. Semantic HTML, local CSS, no build or JavaScript required. |
| `docs/projects/` | Maintained course sites, paper pages, and static demos. |
| `papers/` | Research index and shared paper styles. |
| `archive/portfolio-2026-11-01/` | Preserved previous portfolio pages, styles, and project registries. |
| `canadian-funding-database/` | Static public directory, source SQLite data, and optional developer API. |
| `csci-2110-practice-site/`, `bank-interview-prep/`, `pdf-splitter/`, `polymarket-dashboard/` | Standalone public apps with their existing URLs. |
| `polymarket-local/`, `simply-the-best-house-sitters/`, `propsignal/`, `vp-inspector-extension/` | Separate source projects with their own runtime or packaging requirements. |
| `1315HELP/`, `calc-1000-prep/`, `csci 1120 prac websiute/`, `New folder (4)/`, `_backups/` | Earlier course/source material retained for continuity. |

Existing project directories stay in place so bookmarks and links keep working. `/docs/` forwards to the current landing page. `/real-estate-analyzer/` forwards to the maintained calculator under `docs/projects/re-analyzer/`. The older `portal.css` and `projects.js` files are retained for compatibility; the current landing page does not use them.

## Editing and previewing

1. Edit the root `index.html` to update the landing page and project directory.
2. Edit `assets/portfolio.css` for the landing page design.
3. Edit each linked project in its existing directory. Course material and question banks live with their respective courses.
4. Serve the **repository root** with any static HTTP server to preview locally. Opening an HTML file directly may not support apps that fetch JSON.
5. Check desktop and mobile layouts, local links, and the affected app’s interactions before publishing.

There is no repository-wide install or build step. For example, a developer with Node.js can run `npx http-server .` from the repository root. Visitors do not need a local server or installed dependencies.

GitHub Pages serves this repository from the **root of `main`**, at `/my-portfolio/`. Keep that deployment source: using `/docs` as the Pages root would break the existing public routes. `.nojekyll` keeps the static files available as authored. Files committed to this public repository are public, including source and supporting material.

## Funding data updates

The public funding directory loads `canadian-funding-database/programs.json`, not a localhost API. After changing the source database, run:

```sh
python3 canadian-funding-database/export_data.py
```

Commit the updated database and export together. The export retains the 140 program records and excludes the clearly marked template row. Dates, status, and eligibility are a historical snapshot; see the provider for current terms. [More on the data and optional API](canadian-funding-database/README.md).

## Checks

Assembly Lab has its own [review instructions and tests](docs/projects/assembly-lab/README.md). The property calculator’s existing formula suite is available at `docs/projects/re-analyzer/index.html?test=true`. Other projects keep their own checks and documentation alongside their source.

