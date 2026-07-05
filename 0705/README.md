# Jiatong Wei Profile Wiki

This is the clean rebuild of the personal site for `https://jiatong-wei.github.io/profile/`.

All source code for the new site lives in this `0705` directory. The repository root only needs a minimal GitHub Pages workflow that builds `0705` and deploys `0705/out`.

## Commands

```powershell
npm.cmd install
npm.cmd run lint
npm.cmd run build
npm.cmd run dev
```

## Content Rules

- Wiki notes live in `content/wiki`.
- Projects live in `content/projects`.
- Papers and research notes live in `content/papers`.
- A note is public only when its frontmatter includes `publish: true`.
- Obsidian-style links are supported with `[[note-slug]]` and `[[note-slug|alias]]`.
