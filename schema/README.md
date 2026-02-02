# Core Scene Schema v0.1

## Purpose

This file defines the **Core Scene Schema** for the project.

The schema is a **tool-agnostic contract** that describes *scene intent* — not implementation details.  
It exists to provide a stable, shared source of truth that multiple interpreters (e.g. Blender, Krita, game engines, or text renderers) can consume without modifying the underlying data.

If you are looking for:
- Blender automation logic → this is **not** the place
- Krita paint instructions → this is **not** the place
- UI state or frontend flow → this is **not** the place

This schema deliberately sits *above* all of those concerns.

---

## Design Philosophy

The schema follows a few strict principles:

- **Intent over execution**  
  The schema describes *what the scene is*, not *how it is rendered*.

- **Deterministic by default**  
  The same input scene should always produce the same outputs when interpreted.

- **Non-destructive workflows**  
  Interpreters must not mutate or rewrite scene data.

- **Presentation is a projection**  
  Views, styles, and outputs are projections of the same scene intent.

- **Boring is good**  
  Stability and clarity are more important than cleverness.

---

## What Belongs in This Schema

The schema may contain:

- Scene identity and descriptive metadata
- View selection (e.g. text, top-down, isometric)
- Abstract layout intent (zones, floors, grids)
- Ergonomic rules and scale assumptions
- Asset *intent* (archetypes, roles, state)
- Expressive lighting intent
- Style and presentation hooks
- Output targets and constraints

All values should be **symbolic or qualitative**, not implementation-specific.

---

## What Must NOT Be Added

The following must **never** be added to the core schema:

- Geometry, vertices, or mesh data
- Material definitions or shaders
- Brush presets or texture paths
- Engine-specific configuration
- UI state or editor preferences
- Animation timelines
- AI prompts or generative instructions

If a field requires Blender, Krita, or a game engine to make sense, it does not belong here.

---

## Interpreters

An **interpreter** is any system that reads this schema and produces an output.

Examples:
- A Blender interpreter that generates a blockout scene
- A Krita interpreter that produces layered paintovers
- A text interpreter that renders narrative descriptions
- A game engine exporter

Interpreters must:
- Treat this schema as read-only
- Fail gracefully on unknown fields
- Document which fields they consume
- Never require schema changes for presentation differences

---

## Versioning

- This file represents **v0.1**
- Backward compatibility is preferred over breaking changes
- Additive changes are allowed
- Renames and removals require strong justification

When the schema changes:
- Update the version
- Document the change clearly
- Preserve older examples where possible

---

## Minimal Valid Scene

A minimal valid scene must always be possible.

Interpreters should assume missing sections imply defaults, not errors.

This guarantees:
- Low barrier to entry
- Forward compatibility
- Ease of experimentation

---

## Relationship to the Rest of the Project

This schema is the **foundation** of the pipeline.

Everything else:
- Blender scripts
- Krita themes
- Frontend tooling
- Automation workflows

…is built *on top of it*, not alongside it.

If something feels hard to implement without changing the schema, that is usually a sign the responsibility belongs in an interpreter instead.

---

## Guiding Rule

If there is ever uncertainty about whether something belongs here, default to **not adding it**.

It is far easier to add intent later than to remove coupling once it exists.
