# Krita Responsibilities

## Role
- Presentation and paintover interpreter of structured scene outputs.
- Applies theme-driven presentation on top of structural renders without altering intent.

## Inputs Consumed
- Rendered structural outputs from Blender.
- Render passes: depth, ID/mask, and lighting.
- Theme and style constraints defined by the Core Scene Schema.

## Responsibilities
- Produce non-destructive, layered paintover output.
- Enforce theme-driven stylistic consistency.
- Use render passes to respect structure, depth, and object boundaries.
- Preserve the scene intent and composition established upstream.

## Explicit Non-Responsibilities
- Does not decide layout or camera selection.
- Does not invent or redefine style beyond the provided theme.
- Does not modify scene intent, structure, or asset selection.
- Does not introduce new objects or narrative elements.

## Operating Principles
- Respect the upstream structure as fixed.
- Keep outputs editable and reversible.
- Use passes to guide precision, not to reinterpret intent.
