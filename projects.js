/**
 * projects.js — Central registry for all portfolio projects.
 *
 * To add a new project, append an object to the PROJECTS array below.
 * Fields:
 *   id          – unique slug (no spaces)
 *   title       – display name
 *   description – one or two sentences shown on the card
 *   path        – relative URL to the project's index.html
 *   tags        – array of short labels (tech / topic)
 *   badge       – optional ribbon text, e.g. "New" | "WIP" | "Live"
 *   badgeColor  – optional CSS color for the badge background
 *   icon        – emoji or short SVG string used as the card icon
 */

const PROJECTS = [
  {
    id: "discrete-math-course",
    title: "Discrete Math for CS",
    description:
      "A complete 30-class course bridging discrete mathematics, formal proof, and Java programming. Every concept ships with rigorous proofs and runnable Java code.",
    path: "docs/projects/discrete-math/index.html",
    tags: ["Discrete Math", "Java", "Proofs", "Course"],
    badge: "Featured",
    badgeColor: "#6366f1",
    icon: "∑",
  },
  {
    id: "proof-practice",
    title: "Proof Practice Exams",
    description:
      "Interactive proof-step arrangement tool for mastering mathematical proof structure. Drag-and-drop exercises across multiple proof types.",
    path: "docs/projects/proofs/index.html",
    tags: ["CSCI 1315", "Proofs", "Interactive"],
    badge: null,
    icon: "∴",
  },
  {
    id: "csci1120-exam-prep",
    title: "CSCI 1120 Exam Prep",
    description:
      "A full-featured practice exam platform with leaderboards, student profiles, statistics tracking, and timed quiz modes.",
    path: "docs/projects/csci-1120-prep/index.html",
    tags: ["CSCI 1120", "Practice Exams", "Quiz"],
    badge: null,
    icon: "🎓",
  },
  {
    id: "csci2110-practice-site",
    title: "CSCI 2110 Practice Site",
    description:
      "An isolated practice exam site for Data Structures with module banks for BSTs, heaps, hashing, and graph-focused review.",
    path: "csci-2110-practice-site/index.html",
    tags: ["CSCI 2110", "Data Structures", "Practice Exams", "Quiz"],
    badge: "New",
    badgeColor: "#0ea5e9",
    icon: "🌲",
  },
  {
    id: "pdf-too-big-splitter",
    title: "PDF too big",
    description:
      "Browser-only PDF splitter with page/chunk modes and optional max file size per part.",
    path: "pdf-splitter/index.html",
    tags: ["PDF", "Utility", "File Tools", "Browser App"],
    badge: "Utility",
    badgeColor: "#f59e0b",
    icon: "📄",
  },
  {
    id: "real-estate-analyzer",
    title: "RE Investment Analyzer",
    description:
      "A real estate investment analysis tool with cash flow projections, target price calculator, deal comparison, and saved deals — all in the browser.",
    path: "docs/projects/re-analyzer/index.html",
    tags: ["Real Estate", "Finance", "Calculator", "Charts"],
    badge: "New",
    badgeColor: "#10b981",
    icon: "🏠",
  },
  {
    id: "polymarket-dashboard",
    title: "Polymarket Lab",
    description:
      "A paper trading dashboard for Polymarket prediction markets. Live market data, signal detection (arbitrage, high conviction, near resolution), $10,000 virtual account, and a Data Lab for API exploration.",
    path: "polymarket-dashboard/index.html",
    tags: ["Trading", "Finance", "APIs", "Prediction Markets"],
    badge: "WIP",
    badgeColor: "#a78bfa",
    icon: "📈",
  },
  {
    id: "bank-interview-prep",
    title: "DataGuard Academy",
    description:
      "A 10-module interactive interview prep course for bank data classification roles — covering SQL, Python, cloud, compliance, DSPM, and AI/ML with quizzes, progress tracking, and a full Q&A bank.",
    path: "bank-interview-prep/index.html",
    tags: ["Banking", "Data Classification", "SQL", "Python", "Security", "Course"],
    badge: "New",
    badgeColor: "#0ea5e9",
    icon: "🏦",
  },
  {
    id: "calc-1000-prep",
    title: "CALC 1000 Derivative Practice",
    description:
      "A broad memorization tool for Calculus 1 covering all standard derivative rules — power, product, quotient, chain, trig, inverse trig, exponential, logarithmic, implicit differentiation, parametric, and geometric formulas.",
    path: "docs/projects/calc-1000-prep/index.html",
    tags: ["CALC 1000", "Calculus", "Derivatives", "Practice Exams", "Quiz"],
    badge: "New",
    badgeColor: "#8b5cf6",
    icon: "∂",
  },
];
