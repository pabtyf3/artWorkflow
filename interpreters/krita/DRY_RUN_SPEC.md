# Krita Interpreter — Dry-Run Specification

## Purpose

The **dry-run Krita interpreter** translates validated Core Scene intent (and optionally Blender dry-run output)
into a **structured workspace plan** describing what a Krita document *would* contain.

It does **not** invoke Krita, generate images, or create files.

Its role is to:
- verify interpretation logic
- validate layer structure decisions
- ensure stylistic intent is respected without invention
- support prompt-driven, hands-off iteration
- provide deterministic, inspectable output

---

## Position in the Pipeline

The dry-run Krita interpreter operates:

- **after** Core Scene validation
- **after** (optional) Blender dry-run execution
- **before** any Krita Python automation

Pipeline context:

```
Core Scene JSON
      ↓
validateCoreScene
      ↓
(Optional) Blender Dry-Run Plan
      ↓
Dry-Run Krita Interpreter
      ↓
Workspace Plan (text / JSON)
      ↓
(Optional) Krita Python Interpreter
```

---

## Inputs

### Required Input

- A **validated Core Scene JSON** object

### Optional Inputs

- Blender dry-run execution plan (for reference only)

### Interpreter Configuration

Configuration is supplied externally (CLI flags or config object), not via the Core Scene.

Example:

```json
{
  "includeBlenderReference": true
}
```

---

## Outputs

### Primary Output: Workspace Plan

The dry-run interpreter produces a **workspace plan** describing what the Krita interpreter *would* create.

The plan must be:
- deterministic
- stable across runs
- diff-friendly
- explainable to a human reader

---

## Workspace Plan Contents

The workspace plan must include, at minimum:

---

### 1. Document Overview

- Scene id
- Scene title
- Output resolution
- Colour space and bit depth (symbolic)
- Notes on defaults or fallbacks used

Example:

```text
Document: welsh_village_scene
Resolution: 3840x2160
Colour space: RGBA (default)
Bit depth: 16-bit (default)
```

---

### 2. Layer Hierarchy

A deterministic layer structure describing:

- Top-level groups
- Nested groups
- Purpose of each group

Example:

```text
Layers:
- Background
  - Sky
  - Distant landscape
- Midground
  - Buildings
  - Roads
- Foreground
  - Vegetation
- Lighting
- Effects
```

Layer names and ordering must be stable.

---

### 3. Asset-to-Layer Mapping

For each asset in the Core Scene:

- Asset id
- Archetype
- Assigned layer or group
- Representation type:
  - silhouette
  - value block
  - guide shape
  - Blender reference (if provided)

Example:

```text
Asset: house_03
Archetype: building.3bedDwelling
Layer: Midground/Buildings
Representation: flat silhouette
```

No spatial decisions are made here.

---

### 4. Style & Theme Plan

If `style.theme` is present:

- Theme identifier
- Loaded resources:
  - brush presets
  - colour palettes
  - texture sets
- Scope of application:
  - available tools only
  - not auto-applied

If absent:
- Explicit note that neutral defaults are used

---

### 5. Lighting & Mood Layers

A symbolic description of:

- Lighting layers created
- Mood intent reflected
- No literal lighting or shading applied

Example:

```text
Lighting layers:
- Key light guide (left)
- Shadow guide
- Atmospheric overlay (fog)
```

---

### 6. Blender Reference Usage (Optional)

If Blender dry-run output is supplied:

- List of references used
- How they are incorporated:
  - as underlay
  - as guide layers
- Confirmation that layout is not altered

---

### 7. Warnings & Notes

The dry-run interpreter must report:

- Unsupported style themes
- Missing or partial intent
- Ignored optional inputs
- Fallback behaviour

Warnings must be:
- explicit
- non-fatal where possible
- non-creative

---

## Behavioural Rules

The dry-run Krita interpreter MUST:

- Treat Core Scene and Blender plans as read-only
- Respect interpreter responsibilities
- Remain deterministic
- Never invent assets, layout, or visual detail
- Never create files or images

The dry-run Krita interpreter MUST NOT:

- Call Krita APIs
- Make artistic decisions
- Apply brushes, colours, or textures automatically
- Resolve perspective or scale
- Modify input data

---

## Failure Behaviour

The interpreter should:

- Fail clearly on invalid inputs
- Warn on unsupported configurations
- Default to neutral workspace setup when intent is missing
- Never silently compensate for missing data

Failures must be inspectable and explainable.

---

## Relationship to the Krita Interpreter

The dry-run interpreter is:

- a reference plan
- a validation harness
- a prompt-verifiable contract

The real Krita Python interpreter should be implementable
by following the workspace plan exactly.

If the produced `.kra` file diverges from the dry-run plan,
that is considered a defect.

---

## Summary (Intent)

The dry-run Krita interpreter exists to answer one question:

> **“What workspace would Krita create for this scene — and why?”**

If the answer is:
- predictable
- boring
- explainable
- editable by a human

Then the interpreter is correct.
