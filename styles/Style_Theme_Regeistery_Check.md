# Style / Theme Registry Specification

## Purpose

The **Style / Theme Registry** defines how visual style is expressed, constrained, and shared
within the artWorkflow pipeline.

Its goal is to provide **consistent artistic direction** without automating or generating art.

A style theme defines:
- what tools are available
- what visual ranges are encouraged
- what constraints apply

It does **not** define:
- finished visuals
- composition
- layout
- artistic decisions

The human artist remains the creative authority.

---

## Role in the Pipeline

Style themes are consumed by:

- the **Krita interpreter** (primary)
- optional frontend authoring tools
- future real execution interpreters

They are referenced from the Core Scene via:

```json
"style": {
  "theme": "storybook_painterly",
  "overrides": {}
}
```

Themes are **optional**. Absence always implies neutral defaults.

---

## Design Principles

### Constraining, Not Generating
Themes limit *what is available*, not *what must be used*.

### Deterministic Resolution
Given the same theme identifier, the same resources are resolved.

### Explicit Over Implicit
Themes never guess, blend, or infer style.

### Shareable & Portable
Themes are intended to be reusable across projects and contributors.

---

## Theme Registry Structure

Themes are defined as **static data**, not code.

Recommended location:

```
styles/
 └─ themes/
     └─ storybook_painterly/
         ├─ theme.json
         └─ README.md
```

---

## Theme Definition (`theme.json`)

Each theme must define the following sections.

### Required Fields

```json
{
  "id": "storybook_painterly",
  "name": "Storybook Painterly",
  "version": "1.0.0",
  "description": "Soft, illustrative, painterly style suitable for narrative games."
}
```

---

### Tool Availability

Defines what tools may be used.

```json
{
  "tools": {
    "brush_presets": ["soft_round", "dry_brush", "texture_brush"],
    "erasers": ["soft_eraser"],
    "blending_modes": ["normal", "multiply", "overlay"]
  }
}
```

These tools are **made available**, not auto-selected.

---

### Colour & Value Constraints

Defines suggested ranges, not fixed palettes.

```json
{
  "colour_constraints": {
    "palette": "storybook_warm",
    "value_range": "mid",
    "saturation": "moderate"
  }
}
```

Interpreters must treat these as **guidance only**.

---

### Texture & Material Guidance

```json
{
  "textures": {
    "allowed": ["paper_grain", "canvas_soft"],
    "usage_notes": "Textures should be subtle and non-dominant."
  }
}
```

---

### Layer & Workflow Hints

Optional hints for workspace organisation.

```json
{
  "workflow": {
    "preferred_layers": ["Background", "Midground", "Foreground", "Lighting"],
    "notes": "Encourage separation of lighting for paint-over flexibility."
  }
}
```

These hints must never override interpreter responsibilities.

---

### Restrictions (Optional)

Explicit exclusions to preserve style consistency.

```json
{
  "restrictions": {
    "disallowed_tools": ["hard_round", "photo_textures"],
    "notes": "Avoid overly sharp or photographic elements."
  }
}
```

---

## Overrides

Scene-level overrides may be supplied:

```json
"style": {
  "theme": "storybook_painterly",
  "overrides": {
    "colour_constraints.saturation": "low"
  }
}
```

Rules:
- Overrides are shallow and explicit
- Invalid overrides must be ignored with a warning
- Overrides never introduce new capabilities

---

## Interpreter Responsibilities

### Krita Interpreter

The Krita interpreter MAY:
- load theme metadata
- make tools available
- organise resources
- annotate workspace plans

The Krita interpreter MUST NOT:
- auto-apply styles
- paint using theme data
- enforce stylistic choices

---

### Other Interpreters

Other interpreters may:
- ignore style themes entirely
- or use them only for annotation

Style themes must never affect layout or structure.

---

## Validation Rules

Theme registries should be:
- JSON schema validated
- versioned
- immutable once published

Invalid or missing themes must:
- fall back to neutral defaults
- emit warnings
- never fail the pipeline

---

## Summary

The Style / Theme Registry exists to answer one question:

> **“What stylistic tools and constraints are available for this scene?”**

Not:
- “What should it look like?”
- “How should it be painted?”

If a theme starts deciding outcomes, it has gone too far.
