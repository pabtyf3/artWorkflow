# artWorkflow

**artWorkflow** is an open‑source, spec‑first scene authoring and interpretation pipeline designed to help technically‑minded developers turn *structured intent* into editable art workflows — without relying on generative AI art.

It focuses on **clarity, determinism, and human control**, making it especially suitable for solo developers, small teams, and narrative‑driven games.

---

## What This Project Is

artWorkflow is:

- A **scene intent schema**
- A set of **interpreters** that consume that intent
- A **CLI** for validation and inspection
- A governed workflow for **human + AI collaboration**

It is **not**:

- A renderer
- A game engine editor
- A generative art system
- A replacement for artists

The goal is to reduce friction, not remove judgment.

---

## Core Philosophy

### Intent Over Precision
Scenes describe *what exists* and *how things relate*, not exact geometry or pixels.

### Non‑Destructive by Default
All outputs are inspectable and reversible. No step mutates source intent.

### AI as Proposer, Not Authority
AI tools may help implement or interpret specs, but humans remain in control.

### Deterministic Pipelines
Given the same input, the system produces the same output.

---

## High‑Level Pipeline Overview

```text
Human description / editor input
        ↓
Core Scene JSON (schema‑validated)
        ↓
CLI validation
        ↓
Dry‑Run Interpreters
   ├─ Blender (structure & ergonomics)
   └─ Krita (2D workspace preparation)
        ↓
Inspectable plans (JSON)
        ↓
(Optional) Real execution
   ├─ Blender scene generation
   └─ Krita document creation
```

At every stage, the output can be reviewed, edited, or discarded.

---

## Core Scene Schema

The **Core Scene** is the single source of truth.

It captures:
- scene metadata
- view intent (top‑down, isometric, etc.)
- layout (floors, zones)
- assets and archetypes
- ergonomics (human‑scale assumptions)
- lighting and mood
- style intent
- output targets

Validation is enforced using Zod to ensure schema correctness before interpretation.

---

## Interpreters

Interpreters consume validated scene intent and produce *plans*, not art.

### Blender Interpreter
Responsible for:
- spatial structure
- scale and ergonomics
- camera setup
- placeholder geometry

It answers:
> “Where are things, at a human‑sensible scale?”

Includes:
- a dry‑run interpreter (no Blender required)
- a future real execution interpreter

### Krita Interpreter
Responsible for:
- 2D workspace preparation
- layer hierarchy
- style tool availability
- paint‑over readiness

It answers:
> “What workspace should an artist start from?”

It does **not** paint, render, or invent visuals.

---

## Dry‑Run Interpreters

Dry‑run interpreters are a key concept in artWorkflow.

They:
- never create files
- never call external tools
- never invent content
- return deterministic, inspectable JSON plans

Dry‑runs make the pipeline:
- testable
- reviewable
- safe for automation
- suitable for AI‑assisted iteration

If a real interpreter’s output diverges from its dry‑run plan, that is considered a defect.

---

## Command Line Interface (CLI)

The CLI is the main entry point for validation and inspection.

### Validate a Scene

```bash
artworkflow scene.json
```

Validates the Core Scene against the schema.

---

### Blender Dry‑Run

```bash
artworkflow interpret blender --dry-run scene.json
```

Outputs a Blender execution plan as JSON.

---

### Krita Dry‑Run

```bash
artworkflow interpret krita --dry-run scene.json
```

Outputs a Krita workspace plan as JSON.

---

### Krita Dry‑Run with Blender Reference

```bash
artworkflow interpret krita --dry-run --include-blender-reference scene.json
```

Runs Blender dry‑run first and feeds the result into the Krita dry‑run interpreter.

---

## Governance & AI Usage

This repository includes an **AGENTS.md** file which defines:

- how AI tools may operate
- what they are allowed to change
- how specs and code relate
- documentation expectations

This ensures long‑term consistency and prevents architectural drift.

---

## Documentation‑First Development

Because this project is open source:

- documentation is considered part of the implementation
- specs are written before or alongside code
- behaviour should always be explainable in plain language

If something cannot be clearly documented, it is likely the wrong abstraction.

---

## Contributor Setup

### Node Version

This repo targets Node 22.

If you use nvm:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

Then:

```bash
nvm install
nvm use
```

---

## Who This Is For

artWorkflow is especially useful if you:

- are a solo dev or small team
- are technically‑minded but artistically inconsistent
- want repeatable, editable art workflows
- value control over automation
- want to avoid opaque generative systems

---

## Project Status

The core schema, dry‑run interpreters, and CLI are **stable**.

Next areas of exploration include:
- style/theme registries
- frontend scene authoring tools
- real Blender and Krita execution backends

---

## License

This project is intended to be free and open source.
See the LICENSE file for details.
