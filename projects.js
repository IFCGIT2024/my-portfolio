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
    id: "bank-interview-prep",
    title: "DataGuard Academy",
    description:
      "A 10-module interactive interview prep course for bank data classification roles — covering SQL, Python, cloud, compliance, DSPM, and AI/ML with quizzes, progress tracking, and a full Q&A bank.",
    path: "docs/projects/bank-interview-prep/index.html",
    tags: ["Banking", "Data Classification", "SQL", "Python", "Security", "Course"],
    badge: "New",
    badgeColor: "#0ea5e9",
    icon: "🏦",
  },
];
