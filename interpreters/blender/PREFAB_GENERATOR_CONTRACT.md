# Prefab → Generator Contract (Blender)

This document defines the minimal, tool-agnostic contract between the Blender
dry-run prefab planner and future prefab generators. It is intentionally
conservative and does not authorize geometry generation on its own.

---

## Definitions

**Prefab**
A prefab is a symbolic, deterministic identifier for a concrete asset variant.
It represents *what* should be generated, not *how* it is generated.

**Prefab Key**
```
<asset_id>::<detail_tier>::<variant>
```

The prefab key:
- MUST be stable and deterministic.
- MUST NOT encode style, layout, or scene placement.

---

## Planner Guarantees

The planner (dry-run interpreter) MUST:
- provide a prefab key derived from the registry-supported detail tier and variant
- provide the asset archetype id
- provide the archetype structural parts
- provide the selected detail tier and variant
- provide the resolved ergonomic baseline
- provide the destination scale profile

The planner MUST NOT:
- provide scene layout, lighting, cameras, or style themes
- infer missing semantics beyond registry data
- mutate or enrich scene data

---

## Generator Input

Generators MUST accept the following inputs:
- prefab identity (prefab key)
- archetype id
- archetype structural parts
- selected detail tier
- selected variant
- resolved ergonomic baseline
- destination scale

Generators MUST NOT require:
- scene layout data
- lighting intent
- camera intent
- style themes

---

## Generator Output

Generators MUST return:
- a success or failure result
- metadata describing what was created (symbolic, tool-agnostic)
- references to generated artefacts as identifiers (not file paths yet)

Generators MUST NOT:
- modify scene data
- infer missing semantic intent
- access global state

Partial generation is not allowed. Failures MUST be explicit and complete.

---

## Error Handling

Generators MUST:
- fail clearly on invalid prefab inputs
- explicitly report unsupported detail tiers or variants
- refuse partial output on any validation failure

---

## Rationale (Non-Normative)

This contract keeps the planning stage deterministic and inspectable while
allowing future generators to be implemented independently of Blender APIs.
