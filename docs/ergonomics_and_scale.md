# Ergonomics and Scale Reference

## Purpose

This document defines the **ergonomics and scale contract** for the asset and archetype system.

Most designed objects already embed ergonomics implicitly. This project makes those assumptions **explicit, consistent, and deterministic**, so that:

* assets feel correct without manual tuning
* contributors do not re‑invent scale decisions
* Blender never becomes the source of truth
* regenerated assets remain compatible over time

This document exists to **anchor intent and ownership**, not to enumerate measurements.

---

## Scope and Authority

This document is **authoritative** at the design level.

It defines:

* where ergonomic decisions live
* which layers may (and may not) reason about scale
* how proportions are derived and applied

It does **not**:

* expose numeric tables
* define schemas
* prescribe Blender implementation details
* attempt medical or standards‑body precision

Numeric values are intentionally kept in **code**, not documentation.

---

## Ownership Model

### TypeScript (Semantic Layer)

TypeScript owns all decisions relating to:

* human scale assumptions
* ergonomic reference models
* proportional relationships
* resolved physical dimensions

Archetype generators:

* import ergonomic helpers
* resolve intent into concrete dimensions
* emit deterministic, Blender‑ready parameters

This layer answers:

> "What dimensions make sense for a human‑usable object?"

---

### Blender (Execution Layer)

Blender is a **realisation tool**, not a decision maker.

Blender:

* receives resolved parameters
* constructs geometry
* applies modifiers, joins, and materials

Blender never:

* chooses scale
* interprets ergonomics
* adjusts proportions by eye
* stores canonical truth

Blender answers only:

> "How do I build this?"

---

## Unit System

All archetype generators and Blender scripts assume:

* **1 Blender unit = 1 metre**
* Z axis is up
* Objects rest on Z = 0 unless otherwise specified

This assumption is global and non‑negotiable.

---

## Canonical Human Reference

All ergonomics are anchored to a **single canonical reference body**.

By default, this is the **base human reference**, representing:

* an adult human
* average build
* neutral posture (standing or seated, context dependent)

The system does **not** model humans explicitly, but all designed objects assume interaction with this reference.

### Reference Body Extension

The base human reference is intentionally **extendable**.

Future reference bodies (e.g. dwarves, giants, children, stylised humanoids) may be defined as **derivations of the base reference**, typically via proportional scaling rather than absolute redefinition.

Key rules:

* extensions derive from the base reference
* ergonomic rules remain invariant
* proportions change, not principles

Selection of a non-base reference body, if supported, is always **explicit** and never implicit.

Percentile philosophy:

* mid-range adult for object dimensions
* conservative clearances for passage and movement

Exact numeric values are defined in code and may be revised deliberately.

---

## Ergonomic Principles

The following principles guide all archetypes:

* designed objects are human interfaces
* scale is constrained, not stylistic
* proportions must feel immediately plausible
* clearances assume real human movement
* interaction surfaces align with natural posture

Examples:

* chairs support seated humans
* tables align with seated reach and elbow height
* doors allow upright passage with carried objects
* stairs are climbable without strain

These principles are encoded into archetype logic, not scenes or assets.

---

## Relationship to Archetypes

Archetypes:

* encode ergonomic constraints
* resolve proportions internally
* expose only semantic configuration upstream

Parts:

* derive size from archetype context
* never decide scale independently

Detail tiers:

* affect geometric richness only
* never affect ergonomics or dimensions

Variants:

* affect expression (material, condition, colour)
* never affect scale or proportion

---

## Scenes and Layout

Scenes:

* describe relationships and placement
* do not encode measurements
* do not override object dimensions

Layout systems may:

* compress or expand spacing
* express clutter or density

They may not:

* resize assets
* violate ergonomic clearances

Poor layouts are allowed to feel poor; assets remain correct.

---

## Determinism and Regeneration

Ergonomic decisions are:

* deterministic
* centrally defined
* reproducible

If ergonomic logic changes:

* assets are regenerated
* Blender output is disposable
* upstream truth always wins

Manual correction of generated geometry is not expected.

---

## Non‑Goals

This system does **not** aim to provide:

* medical‑grade ergonomic modelling
* accessibility compliance simulation
* cultural or historical precision
* stylised exaggeration by default

These may be layered later as **explicit extensions**, never as accidents.

---

## Guiding Principle

> Designed objects are human interfaces. Ergonomics is their protocol.

This document exists to ensure that protocol is implemented once, consistently, and without debate.
