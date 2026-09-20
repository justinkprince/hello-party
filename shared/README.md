# shared/

Types and code used by more than one app. Grows from Phase 0 onward; update `docs/contracts.md` with any message or schema change.

- `character/`: the Character types, the rig, the renderer, the v1 clips, and the skin ramp (Phase 1, decisions D-35 to D-45). Plain TypeScript with no `package.json`; apps import it by relative path, for example `import { createCharacter } from '../../../shared/character'`. It reads the parts from `assets/parts/` through Vite (`import.meta.glob`), so an app that uses it needs `types: ["vite/client"]` in its `tsconfig.json`, `"../../shared"` in `include`, and `server.fs.allow` for the repo root in `vite.config.ts` (see `web/display/`).
