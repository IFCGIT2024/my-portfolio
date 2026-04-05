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
    path: "New folder (4)/site/index.html",
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
    path: "1315HELP/index.html",
    tags: ["CSCI 1315", "Proofs", "Interactive"],
    badge: null,
    icon: "∴",
  },
  {
    id: "csci1120-exam-prep",
    title: "CSCI 1120 Exam Prep",
    description:
      "A full-featured practice exam platform with leaderboards, student profiles, statistics tracking, and timed quiz modes.",
    path: "csci 1120 prac websiute/index.html",
    tags: ["CSCI 1120", "Practice Exams", "Quiz"],
    badge: null,
    icon: "🎓",
  },
  {
    id: "real-estate-analyzer",
    title: "RE Investment Analyzer",
    description:
      "A real estate investment analysis tool with cash flow projections, target price calculator, deal comparison, and saved deals — all in the browser.",
    path: "real-estate-analyzer/index.html",
    tags: ["Real Estate", "Finance", "Calculator", "Charts"],
    badge: "New",
    badgeColor: "#10b981",
    icon: "🏠",
  },
];
