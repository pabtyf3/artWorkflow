# Architecture Overview

This document explains the **core architecture and design philosophy** of the artWorkflow project.
It is intended for future maintainers (including future-you) and contributors, and exists to
explain *why* the system is structured the way it is — not just *what* the code does.

---

## High-level goals

artWorkflow is designed to:

- Convert **human intent** into **structured, inspectable scene data**
- Remain **deterministic and reproducible**
- Avoid opaque “magic” steps
- Keep humans firmly in control of artistic decisions
- Separate *planning* from *execution*

This is not an art generator.
It is an **art workflow and tooling system**.

---

## Core principle: Plan first, execute later

The most important architectural decision in this project is the strict separation between:

- **Planning**
- **Execution**

Everything up to prefab generation is *planning*.
Actual DCC execution (Blender, Krita) is a **future concern** and intentionally deferred.

This separation ensures:
- Debuggability
- Inspectability
- Safety
- Testability

---

## Major layers

### 1. Core Scene Schema

**Location:** `validation/zod/coreScene.ts`

The Core Scene schema defines *intent*, not geometry.

It answers questions like:
- What exists in the scene?
- How are things related?
- What is the ergonomic scale?
- What is the view intent?

It does **not** answer:
- Exact mesh topology
- Materials or textures
- Tool-specific instructions

All downstream systems rely on validated Core Scene data.

---

### 2. Asset Registry

**Location:** `assets/registry/`

The Asset Registry defines:
- What *kinds* of things can exist (archetypes)
- What concrete assets are available
- Supported detail tiers and variants

The registry is:
- Declarative
- Validated
- Read-only at runtime

Generators never query the registry directly.
Resolution happens during planning.

---

### 3. Dry-run interpreters

**Locations:**
- `interpreters/blender/dryRunInterpreter.ts`
- `interpreters/krita/dryRunInterpreter.ts`

Dry-run interpreters:
- Translate scene intent into **execution plans**
- Never create files
- Never invoke external tools
- Never mutate input data

They answer:
> “If we were to execute this scene, what would we *intend* to do?”

For Blender, this includes:
- Asset resolution
- Prefab planning
- Ergonomic interpretation
- View and lighting intent

For Krita, this includes:
- Document setup
- Layer structure
- Style/theme availability

---

### 4. Prefab planning

Prefab planning lives inside the **Blender dry-run interpreter**.

It resolves:
- Which assets become prefabs
- Which detail tier and variant should be used
- A stable `prefabKey` identifying the intended build

No geometry is created here.
This is still planning.

---

### 5. Prefab → Generator contract

**Location:** `interpreters/blender/types/prefabGenerator.ts`

This contract defines the boundary between planning and generation.

Key ideas:
- Generators are **pure functions**
- Inputs are fully explicit
- Outputs are structured data
- No IO, no execution, no side effects

Generators emit:
- A summary of what would be created
- Stable artefact identifiers
- Tool-specific scripts *as data*

This makes generators testable and inspectable.

---

### 6. Generator dispatch

**Location:** `interpreters/blender/generators/dispatch.ts`

The dispatch layer:
- Is the **only place** that knows which generators exist
- Maps `prefabKey` → generator function
- Enforces explicit support

Planners and CLIs never call generators directly.

This prevents accidental coupling and hidden dependencies.

---

### 7. Concrete generators

**Location:** `interpreters/blender/generators/`

Each generator:
- Handles one archetype + tier + variant combination
- Is intentionally small and explicit
- Emits Blender Python scripts as data
- Applies ergonomics and scaling locally

Duplication between generators is acceptable early on.
Abstractions are added only when clearly justified.

---

### 8. CLI orchestration

**Location:** `tools/cli.ts`

The CLI is an **orchestrator**, not a decision-maker.

Responsibilities:
- Parse arguments
- Validate input
- Call planners
- Dispatch generators
- Print structured output

The CLI:
- Does not execute Blender
- Does not write files
- Does not invent intent

This keeps automation safe and predictable.

---

## Why execution is deferred

Actual Blender or Krita execution introduces:
- OS-specific behavior
- Tool version differences
- Error modes that are hard to inspect

By deferring execution:
- Planning can be validated independently
- Failures are easier to reason about
- The system remains usable even without DCC tools installed

Execution will be added later via a **thin invocation layer**.

---

## What this architecture optimizes for

- Long-term maintainability
- Solo-developer productivity
- Open-source contribution
- Clear mental models
- Incremental expansion

It intentionally does **not** optimize for:
- One-click generation
- Maximum automation
- Black-box AI behavior

---

## How to extend the system safely

When adding new functionality, prefer this order:

1. Update schemas or registries
2. Extend dry-run planning
3. Add or update generators
4. Update dispatch
5. Wire via CLI
6. *Only then* consider execution

If a change requires skipping layers, it’s usually a design smell.


For details on how Blender execution is intentionally isolated and deferred,
see `docs/specs/Blender_Invocation_Layer_Spec.md`.
---

## Final note

This architecture is deliberately “boring”.

That is a feature.

Creative tools benefit from **predictable, explainable foundations** so that
artists and developers can focus their energy where it matters.

If you’re unsure where new code belongs:
- If it decides *what should happen* → planning
- If it decides *how to build something* → generator
- If it actually *runs a tool* → execution layer (future)

When in doubt, stop and document the intent first.
