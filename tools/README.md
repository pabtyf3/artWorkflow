# CLI

This CLI validates Core Scene JSON files against the Core Scene Schema.
Validation checks structure, required fields, and allowed values, but does not enforce artistic correctness.
## Usage

```bash
npm run validate -- examples/scene_minimal.json
```

The CLI expects a single file path argument (no subcommands).

## Behaviour
- On success, prints a confirmation message and exits with code 0.
- On failure, prints the validation error message and exits with code 1.

## Non-Goals
- It does not generate art.
- It does not invoke Blender or Krita.
- It does not modify scene files.
