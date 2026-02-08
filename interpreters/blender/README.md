This folder contains the Blender interpreter and is split into two execution phases.

## Purpose of the Blender Interpreter

Blender is a realisation tool, not a semantic authority. It consumes intent and
produces artefacts; it does not define meaning.

## Two Execution Phases

- **Dry-run (TypeScript)**: deterministic semantic simulation that runs without Blender.
- **Runtime (Python)**: real execution that runs inside Blender.

## Why the Split Exists

- Prevents semantic leakage into Blender runtime code.
- Keeps TypeScript as the canonical source of intent.
- Makes Python runtime code disposable and tool-specific.

## Rules of Thumb

- If it imports `bpy`, it belongs under `runtime/`.
- If it runs without Blender, it belongs under `dry-run/`.

## What This Folder Is Not

- Not a source of semantic truth.
- Not a place to define archetypes or schemas.
