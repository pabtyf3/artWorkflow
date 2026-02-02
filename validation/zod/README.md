# Zod Validation (Core Scene Schema v0.1)

This directory provides a minimal TypeScript setup for validating the Core Scene Schema using Zod.

## Files
- `validation/zod/coreScene.ts` defines the Zod schema.
- `validation/zod/validateScene.ts` exposes a helper that returns human-readable errors.

## Usage

```ts
import { validateCoreScene } from "./validation/zod/validateScene";

const result = validateCoreScene(sceneData);

if (!result.ok) {
  console.error(result.message);
} else {
  console.log("Valid scene", result.data);
}
```

## Notes
- Required top-level keys are enforced.
- Known enums are validated.
- Additional fields are allowed for forward compatibility.
