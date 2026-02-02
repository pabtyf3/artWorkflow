# Blender Interpreter — Dry-Run Specification

## Purpose

The **dry-run Blender interpreter** is a non-destructive, non-Blender implementation that translates a validated Core Scene into a **structured execution plan**, without invoking Blender or producing geometry.

Its purpose is to:
- verify interpretation logic
- expose ambiguities in scene intent
- validate ergonomics and scale handling
- support prompt-driven, hands-off iteration
- provide deterministic, inspectable output

The dry-run interpreter is a **planning and validation tool**, not a renderer.

---

## Position in the Pipeline

The dry-run interpreter operates:

- **after** Core Scene validation
- **before** any Blender Python execution

Pipeline context:

```
Core Scene JSON
      ↓
validateCoreScene
      ↓
Dry-Run Blender Interpreter
      ↓
Execution Plan (text / JSON)
      ↓
(Optional) Blender Python Interpreter
```

The dry-run interpreter may be used independently of Blender.

---

## Inputs

### Required Input

- A **validated Core Scene JSON** object

### Optional Interpreter Configuration

Interpreter configuration is supplied externally (CLI flags or config object), not via the Core Scene.

Example configuration:

```json
{
  "destinationScale": "neutral"
}
```

Supported destination scale profiles:
- `neutral` (default)
- `meters`
- `centimeters`
- future engine-oriented presets

---

## Outputs

### Primary Output: Execution Plan

The dry-run interpreter produces an **execution plan** describing what the Blender interpreter *would* do.

The plan may be:
- human-readable text
- structured JSON
- or both

It must be:
- deterministic
- stable across runs
- diff-friendly
- complete enough to implement against

---

### Execution Plan Contents

The execution plan should include, at minimum:

#### 1. Scene Overview

- Scene identifier
- View type
- Destination scale profile
- Ergonomics profile (if present)

Example:

```text
Scene: welsh_village
View: top_down
Ergonomics: human_standard
Destination scale: meters
```

---

#### 2. Global Scale Resolution

- Declared ergonomic scale baseline
- Derived numeric interpretation (symbolic, approximate)
- Notes on defaulting behaviour

Example:

```text
Scale baseline: human_standard
Resolved door height: standard (≈2.0 units)
Resolved stair rise: comfortable
```

---

#### 3. Asset Interpretation

For each asset:

- Asset `id`
- Archetype
- Category
- Placement intent (symbolic)
- Ergonomic adjustments (if any)
- Planned placeholder representation

Example:

```text
Asset: house_03
Archetype: building.3bedDwelling
Placement:
  - along: main_road
  - side: right
  - order: 4
  - setback: car_width
Representation:
  - primitive: cube
  - scaled for human_standard
```

No geometry is created — this is declarative.

---

#### 4. Paths & Linear Features

For roads, streams, tracks, etc.:

- Identification of linear assets
- Planned representation (spline / strip)
- Relationship to other assets

Example:

```text
Path: main_road
Type: road.primary
Representation: spline
Referenced by: house_01, house_02, house_03
```

---

#### 5. Camera Plan

- Camera type(s)
- Presets applied
- Intended framing purpose

Example:

```text
Camera: isometric_main
Preset: default_isometric
Purpose: overall layout readability
```

---

#### 6. Lighting Plan (Intent Only)

- Lighting intent summary
- No numeric light values required

Example:

```text
Lighting:
  - time_of_day: dusk
  - key_direction: left
  - contrast: medium
```

---

#### 7. Warnings & Notes

The dry-run interpreter must explicitly report:

- missing placement references
- unsupported archetypes
- unsupported ergonomics profiles
- ambiguous intent
- fallback behaviour

Warnings must be:
- non-fatal where possible
- explicit
- non-creative

Example:

```text
Warning: Asset campsite_01 has no explicit placement order; using default clustering.
```

---

## Behavioural Rules

The dry-run interpreter MUST:

- consume Core Scene data read-only
- respect all interpreter responsibilities
- apply ergonomics and destination scale consistently
- remain deterministic
- never invent intent
- never silently fix ambiguity

The dry-run interpreter MUST NOT:

- call Blender APIs
- create files
- generate geometry
- modify scene data
- add artistic interpretation

---

## Failure Behaviour

The dry-run interpreter should:

- fail hard on invalid input
- fail clearly on unsupported configurations
- continue with warnings where intent is incomplete
- never hide errors

Failures must be actionable and explainable.

---

## Relationship to the Blender Interpreter

The dry-run interpreter is:

- a reference implementation
- a testing harness
- a debugging aid
- a prompt-verifiable contract

The Blender Python interpreter should be implementable by **following the execution plan exactly**.

If Blender output differs from the dry-run plan, that is considered a defect.

---

## Summary (Intent)

The dry-run Blender interpreter exists to answer one question:

> **“Given this scene intent, what would Blender do — and why?”**

If the answer is:
- predictable
- boring
- explainable
- reproducible

Then the interpreter is correct.
