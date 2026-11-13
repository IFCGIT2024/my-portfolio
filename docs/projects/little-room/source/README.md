# Little Room source

This directory is the editable source for the standalone Little Room page in the parent directory. The editor is browser-local and has no runtime package dependencies.

With a current Node.js installation, run:

```sh
node --test tests/*.test.cjs
node build.cjs
```

The build writes `../index.html`, the self-contained page served by the portfolio. To build elsewhere, use `node build.cjs --out /path/to/output.html`. The tests focus on geometry, interior walls, saved-room validation, restoration and room templates; they do not replace accessibility and physical-device testing.

Named homes and room templates stay in browser storage. Floor-plan images may be embedded in editable exports. Room templates are illustrative and are not a building-code or accessibility check. Keep existing saved-room compatibility and export/import behavior in mind when changing the document format.
