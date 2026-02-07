# Asset System Design Reference

This document describes the **asset system** portion of the project: its goals, boundaries, and internal structure. It is intended as a **long‑lived reference** to explain *why* the asset system exists and *how* it is meant to function, without prescribing implementation details too early.

This file should live in the repository and be treated as **conceptual documentation**, not a task list.

---

## Purpose

The asset system exists to make the following possible:

- Generate usable 3D assets from **human descriptions**
- Avoid manual modelling for every asset
- Keep assets **reusable, composable, and scalable**
- Prevent Blender (or any DCC) from becoming the source of truth
- Enable higher‑level constructs (rooms, buildings, settlements) later

Without a stable asset layer, everything above it becomes speculative.

---

## Core Promise

> **A human can describe what they need, and the system can produce a usable model without requiring the human to think in geometry.**

This promise defines every design decision below.

---

## What an Asset Is

An **asset** is a reusable, semantically identifiable object such as:

- a chair
- a table
- a bed
- a door
- a window

An asset:
- has a stable identity
- has a known scale and affordances
- can appear in many rooms and scenes
- may have variants

An asset is **not**:
- a scene
- a layout
- a one‑off prop
- a Blender file as canonical truth

---

## Asset Identity and Naming

Assets are identified using semantic namespaces:

```
assets.<category>.<identity>
```

Examples:

- `assets.furniture.chair_simple`
- `assets.structure.door_single`

Rules:
- names are singular
- names describe **silhouette / role**, not decoration
- variants never appear in the name

The asset ID is canonical and never changes.

---

## Human Description → Asset Resolution

The system begins with **natural language input**, e.g.:

> "A wooden dining chair, high backed, with an upholstered seat and no arms."

This description is normalized into **semantic intent**:

- object class: chair
- context: dining
- back: high
- seat: upholstered
- arms: none

This process produces **choices among curated concepts**, not geometry instructions.

---

## Archetypes

Assets are generated using **archetype generators**.

An archetype:
- encodes domain knowledge (e.g. what makes a chair a chair)
- produces geometry programmatically
- is implemented in Blender (Python / nodes)
- is reused across many assets

There are **few archetypes**, e.g.:

- chair
- table
- bed
- door
- window

Assets select *how* an archetype is configured; they do not invent new forms.

---

## Composite Archetypes (Parts)

Archetypes are **composite**, built from semantic parts rather than primitives.

Example (chair):

- supports (legs)
- seat
- back
- optional arms

Each part is:
- culturally meaningful
- named in human terms
- reusable across archetypes

Parts are **not** geometry primitives and never expose mesh logic.

---

## Reusable Structural Parts

Many parts are shared across assets:

- supports (chair legs, table legs, spindles, posts)
- surfaces (seats, tabletops, shelves)
- rails (backs, bannisters, fences)
- connectors (stretchers, aprons)

Parts know how to build themselves, but **do not know where they are used**.

Context is always supplied by the parent archetype.

---

## Detail Tiers

Parts support **detail tiers**, representing geometric richness rather than style.

Typical tiers:

- `basic` — blocky, minimal, low cost
- `profiled` — shaped, smoother
- `carved` — ornate, high detail

Rules:
- detail tiers are monotonic (each tier includes the previous)
- detail tier selection happens at generation time
- detail tier is not a variant

Detail tiers enable:
- performance scaling
- progressive authoring
- socioeconomic storytelling

---

## Variants (Orthogonal Dimensions)

Variants represent **expression**, not structure.

Examples:

- condition: clean / worn / damaged
- material: oak / pine / slate
- color: red / blue / pastel

Rules:
- variants never affect asset identity
- variants are bounded by the asset or prefab
- variants are orthogonal and composable

The same variant system applies at:
- asset level
- room level (wall color, floor material)
- building level (exterior color, roof type)
- settlement level (palette constraints)

---

## Blender’s Role

Blender is a **realization tool**, not an authority.

Blender:
- executes archetype generators
- produces geometry and UVs
- applies procedural or authored materials
- outputs editable artifacts

Blender never:
- defines identity
- stores canonical logic
- silently mutates upstream data

---

## Krita and Asset Promotion (Optional)

Assets may be **promoted** to hand‑authored textures when more character is needed.

Promotion rules:
- geometry is frozen
- UVs are locked
- textures are authored structurally (with masks)
- variants remain parametric where possible

Promoted assets are reusable and stable, but no longer regeneratable.

---

## Abstraction Boundary (Critical Rule)

> **The semantic system never models geometry primitives.**

The system stops at:
- legs
- handles
- backs
- frames

It never includes:
- spheres, cubes, cones
- bevels
- booleans
- curves

Those belong entirely inside Blender.

---

## Why This Matters

This asset system:

- keeps the human‑to‑model promise honest
- prevents accidental recreation of a DCC tool
- enables massive reuse with limited code
- supports future composition (rooms, buildings, towns)
- allows incremental improvement without refactors

---

## Scope Discipline

The current implementation focus is intentionally narrow:

- asset identity
- asset schema
- archetype generators

Everything else is parked until assets are real.

---

## Guiding Principle

> If it cannot be demonstrated with one chair, it does not exist yet.

---

*This document should be updated deliberately, not reactively.*

