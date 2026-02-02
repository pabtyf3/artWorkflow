# Blender Interpreter — Responsibilities

## Purpose

The Blender interpreter translates **validated Core Scene intent** into a **structural 3D scene scaffold** suitable for:

- layout verification
- composition checks
- camera framing
- lighting intent preview
- downstream paint-over (e.g. Krita)
- eventual engine export

It is a **deterministic interpreter**, not a creative tool.

---

## Role in the Pipeline

The Blender interpreter operates **after**:

- Core Scene JSON has been generated
- Scene has passed `validateCoreScene`

It produces:

- a Blender `.blend` scene
- containing placeholder geometry and structure
- reflecting spatial and compositional intent

It does **not** produce final art.

---

## Ergonomics & Scale (Critical Responsibility)

The Blender interpreter is responsible for enforcing **ergonomic consistency** based on the `ergonomics` section of the Core Scene.

### What Ergonomics Means Here

Ergonomics expresses **relative, human-centric scale intent**, not exact measurements.

Examples:
- door height feels walkable
- stairs feel climbable
- counters feel reachable
- spaces feel navigable

The goal is *plausibility*, not realism.

---

### How the Interpreter Uses Ergonomics

When `ergonomics` is present, the interpreter may:

- Establish a **scene scale baseline** (e.g. human-standard, compact, large)
- Adjust placeholder geometry proportions accordingly:
  - door heights
  - stair rise/run
  - ceiling heights
  - path widths
  - railing heights
- Ensure spatial relationships remain readable and traversable

When `ergonomics` is absent:
- Use a neutral default (human-standard)

---

### Species / Scale Variants

The interpreter must support alternative scale profiles symbolically, such as:
- smaller-than-human (e.g. halfling-scale)
- larger-than-human (e.g. giant or Naʼvi-scale)

These profiles:
- scale proportions consistently
- do NOT alter layout relationships
- do NOT introduce new intent

A change in ergonomics must never change *what* exists — only *how it feels to occupy*.

---

### Destination Scale Profiles (Interpreter Configuration)

The Blender interpreter **may accept a destination scale profile** that determines how symbolic ergonomic intent is realised numerically.

Examples of destination profiles:
- `neutral` (default, abstract units)
- `meters` (1 Blender unit ≈ 1 metre)
- `centimeters` (1 Blender unit ≈ 1 cm)
- engine-oriented presets (e.g. Unity-like, Unreal-like)

Destination profiles:
- affect only numeric realisation of scale
- do NOT alter layout relationships
- do NOT change asset ordering or placement logic
- do NOT introduce engine-specific assumptions into the Core Scene

Destination scale is an **interpreter concern**, not a scene intent concern, and must never be written back into the Core Scene data.

---

### What the Interpreter MUST NOT Do (Ergonomics)

The interpreter must NOT:

- hard-code real-world measurements into scene intent
- assume a specific species or engine unless configured
- rescale individual assets inconsistently
- “correct” proportions artistically

All ergonomic adjustments must be:
- global
- symbolic
- deterministic

---

## What the Blender Interpreter MAY Do

### 1. Scene Structure & Layout

- Create placeholder geometry (“blockout”) for assets defined in `assets[]`
- Resolve **relative placement intent** into approximate 3D positions
- Establish spatial relationships such as:
  - along / before / after
  - left / right of reference
  - near / far
  - clustered / isolated
- Represent paths (roads, tracks, streams) as:
  - simple splines
  - or low-detail meshes

All placement is **approximate and symbolic**, not precise.

---

### 2. Asset Representation

- Represent each asset archetype as:
  - simple primitives (cubes, cylinders, planes)
  - or named placeholder meshes
- Apply clear, readable naming:
  - object names must include asset `id` and `archetype`
- Group objects logically using:
  - collections
  - empties (if useful)

No asset should be mistaken for final geometry.

---

### 3. Camera Setup

- Create cameras based on `view` intent:
  - top-down
  - isometric
  - scene / external views
- Apply named camera presets when specified
- Ensure framing communicates:
  - layout
  - direction
  - emphasis
- Camera parameters are symbolic, not cinematic.

---

### 4. Lighting (Intent Only)

- Set up **basic lighting** to express intent, not realism:
  - time of day
  - key direction
  - contrast level
- Use:
  - simple area / sun lights
  - neutral colours
- Lighting exists to:
  - support composition
  - support paint-over
  - support readability

---

### 5. Determinism & Repeatability

- Given the same Core Scene input and interpreter configuration:
  - output must be structurally equivalent
- Randomness is not permitted unless explicitly allowed
- Object naming, ordering, and grouping must be stable

This is critical for iteration and trust.

---

## What the Blender Interpreter MUST NOT Do

### ❌ No Artistic Decisions

The interpreter must NOT:

- choose materials, textures, or shaders
- add detail beyond placeholders
- “improve” composition creatively
- add props, clutter, or decoration
- invent geometry or embellishment

Artistic refinement happens elsewhere.

---

### ❌ No Intent Invention

The interpreter must NOT:

- add assets not present in the Core Scene
- infer missing relationships
- reinterpret ambiguous intent creatively
- “fix” vague scenes by adding structure

If intent is missing, it must remain missing.

---

### ❌ No Schema Mutation

The interpreter must NOT:

- modify the Core Scene data
- write back changes to JSON
- resolve ambiguity by changing intent

It is a **consumer**, never a source of truth.

---

### ❌ No Game Logic or Engine Assumptions

The interpreter must NOT:

- add collision
- add navigation meshes
- add scripts
- add gameplay logic
- assume a target engine

Those concerns are explicitly out of scope.

---

## Relationship to Other Interpreters

- **Frontend editor**  
  Defines and refines intent.

- **Blender interpreter**  
  Resolves intent into spatial structure and ergonomic scale.

- **Krita interpreter**  
  Refines visual expression on top of Blender output.

Blender is structural and proportional; Krita is expressive.

---

## Failure Behaviour

If the interpreter encounters:

- unknown archetypes
- unsupported placement intent
- incomplete data
- unsupported ergonomics or destination profiles

It must:

- fail clearly, OR
- fall back to a neutral placeholder and default scale
- never invent a solution silently

Errors should be explicit and inspectable.

---

## Summary (Non-Negotiables)

The Blender interpreter is:

- deterministic
- conservative
- boring
- predictable
- structural
- ergonomically consistent
- destination-aware (at the scale level only)

If the output looks “artistic”, it has gone too far.

If the output helps a human understand layout, pacing, **and scale** — it has done its job.
