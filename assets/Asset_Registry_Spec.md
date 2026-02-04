# Asset Registry Specification

## Purpose

The Asset Registry defines how reusable, semantic assets are described, generated, and referenced within the artWorkflow pipeline.

An **asset** represents a *type of thing that can appear in a scene*, independent of:
- layout
- placement
- style
- rendering
- tooling

Assets exist to bridge **semantic intent** and **concrete realisation**, without allowing geometry or tooling concerns to leak upstream.

---

## Scope

This specification governs:

- asset identity
- archetypes
- variants
- detail tiers
- generation boundaries
- interpreter expectations

It does **not** govern:
- scene composition
- spatial layout
- painting or textures
- lighting
- final art direction

---

## Core Principles

### Semantic First
Assets describe *what something is*, not *how it is drawn or built*.

### Reusable by Design
Assets are designed to be reused across:
- scenes
- projects
- scales
- contexts

### Interpreter-Facing
Assets exist to be consumed by interpreters (e.g. Blender), not edited directly by artists.

### Deterministic Resolution
Given the same asset identifier and parameters, the same prefab must be resolved.

---

## Asset vs Archetype

### Archetype

An **archetype** defines a semantic structural pattern.

Examples:
- `furniture.chair`
- `architecture.door`
- `infrastructure.lamppost`

Archetypes:
- define structural expectations
- describe compositional parts (e.g. legs, back, seat)
- never reference geometry primitives
- never include material or texture data

---

### Asset

An **asset** is a concrete, reusable instance of an archetype.

Examples:
- `chair_simple`
- `chair_ornate`
- `door_wooden_standard`

Assets:
- reference exactly one archetype
- define supported variants and detail tiers
- are the unit used by scenes and interpreters

---

## Detail Tiers

Detail tiers define **geometric richness**, not appearance.

Examples:
- `basic`
- `standard`
- `ornate`

Rules:
- Detail tiers affect structural complexity only
- Detail tiers must not encode style
- Detail tiers must not encode materials

Detail tier changes may:
- add or remove structural elements
- alter silhouette complexity

They must not:
- change semantic identity
- affect scale meaning

---

## Variants

Variants define **non-structural expression**.

Examples:
- `wooden`
- `painted`
- `worn`

Rules:
- Variants never alter structure
- Variants must not add/remove parts
- Variants may influence materials downstream
- Variants must be optional and orthogonal to detail tiers

---

## Generation Boundary

Assets may be realised via Blender or other tools, but:

- The Asset Registry is the **source of truth**
- Blender files are **derived artefacts**
- No asset definition may depend on a specific DCC file

Asset generation logic:
- lives downstream of the registry
- must not introduce new semantics
- must not be required for validation or dry-runs

---

## Scene Integration

Scenes reference assets by **asset identifier**.

Scenes must not:
- reference archetypes directly
- reference geometry
- reference materials
- reference Blender files

Interpreters are responsible for resolving asset identifiers into usable representations.

---

## Non-Goals

The Asset Registry explicitly does **not** attempt to:

- generate complete environments
- model rooms, buildings, or towns
- replace level design
- automate artistic decisions
- encode rendering or lighting rules

If a concept cannot be demonstrated with a single asset (e.g. one chair), it is out of scope.

---

## Incremental Development Rule

Asset system development must proceed incrementally.

The system is considered incomplete until:
- one archetype
- one asset
- one detail tier
- one variant

can be:
- defined
- generated
- reused
- resolved by an interpreter

---

## Summary

The Asset Registry exists to answer:

> **“What kind of thing is this, structurally and semantically?”**

Not:
- “Where is it?”
- “How is it painted?”
- “How is it rendered?”

Those questions belong to other layers.
