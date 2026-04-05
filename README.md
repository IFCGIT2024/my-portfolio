# My Project Portal

The front page (`index.html`) auto-builds itself from the project list in `projects.js`.  
**You only ever need to edit `projects.js`.**

---

## Adding a new project

Open `projects.js` and add an object to the `PROJECTS` array:

```js
{
  id: "unique-slug",             // no spaces, used as the card footer label
  title: "Project Name",
  description: "One or two sentences about what it does.",
  path: "folder-name/index.html", // relative path from the root of this repo
  tags: ["Tag1", "Tag2"],         // shown as filter buttons and card chips
  badge: "New",                   // ribbon in top-right corner — set null to hide
  badgeColor: "#10b981",          // any CSS color — ignored if badge is null
  icon: "⚡",                     // emoji or short symbol shown on the card
},
```

Save the file and push to GitHub — done.

---

## Files

| File | What it does |
|---|---|
| `index.html` | Portal landing page — don't edit unless changing layout |
| `portal.css` | All portal styles — don't edit unless changing appearance |
| `projects.js` | **The only file you need to edit to add/remove projects** |

---

## Folder name tip

GitHub Pages encodes spaces in URLs as `%20`, which can break links.  
Keep folder names lowercase with hyphens instead of spaces, e.g. `csci-1120`.  
Update the `path` field in `projects.js` to match if you rename anything.
