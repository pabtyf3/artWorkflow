# Asset Registry

The Asset Registry defines reusable, semantic assets that can be referenced by scenes
and resolved by interpreters. It encodes **what something is**, not how it is built,
rendered, or placed.

This registry is intentionally minimal and data-first. It is designed to grow
incrementally without introducing tool-specific details.

---

## Incremental Growth Rule

The registry must advance in small, verifiable steps. The current proof-of-concept
requires only:

- one archetype
- one asset
- one detail tier
- one variant

New entries should only be added after existing entries can be:
- defined
- reused
- resolved by an interpreter

---

## How Interpreters Use the Registry

Interpreters are expected to:
- resolve `asset_id` to a known archetype
- respect supported detail tiers and variants
- treat the registry as read-only

The registry does **not** provide geometry, materials, placement, or tool data.
Those concerns live downstream.

---

## Registry Loader

The asset registry is loaded through a single helper module at
`assets/registry/loadAssetRegistry.ts`. This loader reads
`assets/registry/assets.json`, validates it with the shared Zod schema, and
builds lookup maps for archetypes and assets. Validation failures return issues
without throwing; duplicate IDs emit warnings instead of crashing.
