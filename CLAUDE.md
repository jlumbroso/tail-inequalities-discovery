# CLAUDE.md - Project Guidance

---

## Git Commits

Format: `type: subject` (lowercase)

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `style`, `perf`, `meta`

Example: `feat: implement JWT authentication per ADR-0014`

`meta:` commits are relative to `AGENTS.md`/`CLAUDE.md`, `.claude` settings, and meta-configuration of the repository.

---

## Project-Specific Notes

- **IMPORTANT NOTE ON COLORS**:
    - main color (background): #FAF9F5     (Claude beige)
    - dominant color 1: #CC7C5E   (Claude orange)
    - dominant color 2: #53B467 (green)

- It's possible the user uses `asdf` for Node.js and Python and the runtime of most languages. You can `source .claude/agent.env` before calling the runtimes, like `python` or `node` to access them through `asdf`'s shims. See: https://asdf-vm.com/manage/configuration.html
