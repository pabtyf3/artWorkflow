# Krita Interpreter — Responsibilities

## Purpose

The Krita interpreter translates **validated Core Scene intent** and (optionally) Blender structural output into a **layered 2D painting workspace** suitable for:

- paint-over
- mood and lighting exploration
- stylistic refinement
- consistent art direction across scenes

It is an **expressive interpreter**, but not a generative or creative authority.

---

## Role in the Pipeline

The Krita interpreter operates **after**:

- Core Scene JSON has been validated
- (Optionally) a Blender scene or dry-run execution plan exists

It produces:

- a Krita `.kra` document
- with structured layers, groups, and presets
- reflecting scene intent, not final art

It does **not** decide layout or scene composition.

---

## What the Krita Interpreter MAY Do

### 1. Document & Canvas Setup

- Create a Krita document using:
  - `output.resolution`
  - aspect ratio derived from resolution
- Name the document using the scene id and title
- Set colour space and bit depth to sensible defaults
- Configure the document for paint-over (not print-ready)

---

### 2. Layer Structure & Organisation

- Create a clear, consistent layer hierarchy, for example:
  - Background
  - Midground
  - Foreground
  - Lighting
  - Effects
- Group layers by:
  - zone
  - archetype category
  - or depth (when applicable)
- Name layers and groups deterministically

Layer structure must prioritise **clarity and editability**.

---

### 3. Asset Representation (2D)

- Represent assets as:
  - flat silhouettes
  - simple value blocks
  - guide shapes
  - imported Blender renders (if provided)
- Place assets according to **existing layout intent**
- Use neutral colours and values unless style dictates otherwise

Assets are **placeholders for painting**, not finished illustrations.

---

### 4. Style & Theme Application

When a `style.theme` is specified, the interpreter may:

- Load predefined:
  - brush presets
  - colour palettes
  - texture sets
- Apply them as:
  - available tools
  - not mandatory choices
- Organise style resources per scene or per project

Themes must:
- constrain available tools
- not force visual outcomes

---

### 5. Lighting & Mood Layers

- Create dedicated layers for:
  - lighting direction
  - shadows
  - atmospheric effects
- Reflect lighting intent symbolically:
  - dusk vs day
  - contrast level
  - fog presence
- Avoid painting literal light or shadows

These layers exist to **guide the artist**, not replace them.

---

### 6. Determinism & Repeatability

- Given the same input:
  - layer structure must be identical
  - naming must be stable
- No randomness unless explicitly allowed
- Style presets must resolve deterministically

---

## What the Krita Interpreter MUST NOT Do

### ❌ No Layout or Spatial Decisions

The interpreter must NOT:

- reposition assets
- change relationships
- resolve perspective
- alter scale

Layout belongs upstream (frontend / Blender).

---

### ❌ No Artistic Invention

The interpreter must NOT:

- invent props
- add narrative details
- decide colour schemes unless explicitly defined
- “improve” composition creatively

The human artist remains the creative authority.

---

### ❌ No Schema Mutation

The interpreter must NOT:

- modify the Core Scene
- write back intent
- infer missing data

It is a consumer, not a source of truth.

---

### ❌ No Rendering or Generation

The interpreter must NOT:

- generate finished art
- use generative AI
- auto-paint details
- simulate materials

It prepares a workspace — nothing more.

---

## Relationship to Other Components

- **Frontend editor**  
  Defines and refines scene intent.

- **Blender interpreter**  
  Resolves spatial structure and ergonomics.

- **Krita interpreter**  
  Prepares expressive 2D workspace for human refinement.

Blender decides *where things are*.  
Krita helps decide *how they feel*.

---

## Failure Behaviour

If the interpreter encounters:

- unsupported style themes
- missing Blender references
- incomplete intent

It must:

- fall back to neutral defaults
- warn clearly
- never invent content

Failures should be visible and inspectable.

---

## Summary (Non-Negotiables)

The Krita interpreter is:

- deterministic
- non-destructive
- expressive but not creative
- workspace-oriented
- human-first

If the Krita file looks “finished”, the interpreter has gone too far.

If it gives an artist a clean, consistent place to work — it has done its job.
