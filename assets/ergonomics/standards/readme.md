# Architectural Standards Layer

## Purpose

The `standards` layer exists to formalise **civilisation-level architectural conventions** separately from human anatomy and ergonomic logic.

This layer defines clustered, defensible values for built space such as:

* Door heights and widths
* Ceiling heights
* Corridor widths
* Stair proportions
* Wall thickness assumptions

It intentionally does **not** define human anatomy, reach envelopes, or interaction-derived measurements.

Those belong in the `ergonomics` layer.

---

## Why This Layer Exists

There are three distinct domains in spatial design:

1. **Biological truth** → `ReferenceBody`
2. **Interaction truth** → ergonomic helper functions
3. **Civilisation conventions** → architectural standards

Architectural standards are not pure ergonomics.
They represent manufacturing norms, construction practices, and long-standing spatial conventions.

For example:

* A door height is influenced by human height, but clustered by construction norms.
* A corridor width allows passing, but stabilises around architectural bands.
* A ceiling height exceeds minimum clearance for comfort and proportion.

Keeping this layer separate prevents:

* Archetypes hardcoding magic numbers
* Doors bypassing ergonomic minimums
* Scale drifting inconsistently across assets

---

## Design Principles

1. **Standards are civilisation-relative**
   Different worlds (modern human, dwarven, giant, etc.) may define different standards.

2. **Standards are not biology**
   They may be informed by ergonomics, but they are not derived directly from anatomy.

3. **Ergonomic minimums always apply**
   Final dimensions should respect both:

   * ergonomic minimums
   * architectural standards

4. **Standards are clustered, not exhaustive**
   Only define values when required by archetypes.

---

## File Responsibilities

### `architecturalStandards.interface.ts`

Defines the shape of a civilisation's architectural conventions.

Example fields:

* `doorHeight`
* `doorWidth`
* `ceilingHeight`
* `corridorMinWidth`
* `stairRise`
* `stairTread`
* `wallThickness`

This file contains **types only**.

---

### `modernHumanStandards.ts`

Provides a concrete implementation of `ArchitecturalStandards` for a contemporary metric residential environment.

Values here should be:

* defensible
* architecturally plausible
* clustered around common residential norms

This file represents a **civilisation profile**, not a global truth.

---

## How Standards Should Be Used

Archetypes should never hardcode spatial values.

Instead, generation logic should:

1. Compute ergonomic minimums from `ReferenceBody`
2. Read architectural defaults from `ArchitecturalStandards`
3. Resolve final dimensions using safe logic

Example (door generation):

```ts
const ergonomicMinHeight = reference.standingHeight + 0.25
const finalDoorHeight = Math.max(
  ergonomicMinHeight,
  standards.doorHeight
)
```

Example (corridor width):

```ts
const ergonomicWidth = comfortableCorridorWidth(reference)
const finalWidth = Math.max(
  ergonomicWidth,
  standards.corridorMinWidth
)
```

This ensures:

* Ergonomic safety
* Civilisation consistency
* Deterministic results

---

## What Should NOT Happen

* Do not import standards directly inside Blender scripts.
* Do not duplicate constants inside archetypes.
* Do not embed standard values inside scene JSON.
* Do not treat these values as immutable across worlds.

Standards are resolved at generation time via a `WorldProfile`.

---

## Relationship to World Profiles

A `WorldProfile` bundles:

* `ReferenceBody`
* `ArchitecturalStandards`

This allows different civilisations to exist without rewriting archetypes.

Example:

* `modernHumanWorld`
* `dwarvenWorld`
* `giantWorld`

Each world can define its own standards while keeping ergonomic logic invariant.

---

## Scope Discipline

Only add new standard values when:

* An archetype requires them
* They represent a true civilisation-level clustering
* They cannot be derived purely from ergonomics

Avoid premature expansion.

---

## Guiding Principle

> Ergonomics defines what bodies need.
> Architectural standards define how a civilisation builds around those needs.

This separation keeps the system deterministic, extensible, and architecturally coherent.
