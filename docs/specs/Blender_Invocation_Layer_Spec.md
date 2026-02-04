# Blender Invocation Layer — Specification

This document specifies the **Blender invocation layer** for artWorkflow.

The invocation layer is intentionally **thin**, **boring**, and **mechanical**.
It exists only to execute previously planned and generated Blender scripts.
It must never invent intent, reinterpret plans, or bypass planning layers.

---

## Purpose

The Blender invocation layer is responsible for:

- Executing Blender Python scripts produced by prefab generators
- Managing Blender process lifecycle
- Capturing execution results and errors
- Remaining fully isolated from planning and generation logic

It is the **only layer** allowed to:
- Launch Blender
- Import `bpy`
- Touch the filesystem on behalf of Blender

---

## Non-Goals

The invocation layer must NOT:

- Interpret Core Scene data
- Perform prefab planning
- Select generators
- Modify generator output
- Apply artistic decisions
- Perform optimisation or batching heuristics
- Contain business logic

If logic appears here, it likely belongs elsewhere.

---

## Position in the architecture

```
Scene → Dry-run planning → Prefab planning
     → Generator dispatch → Generator output (scripts)
     → Blender invocation (this layer)
     → Blender artefacts
```

The invocation layer consumes **only generator outputs**.

---

## Inputs

### Invocation request

The invocation layer accepts a list of **execution units**:

```ts
type BlenderInvocationRequest = {
  invocationId: string;
  mode: "headless" | "gui";
  scripts: Array<{
    prefabKey: string;
    blenderPython: string;
  }>;
  output?: {
    directory: string;
    format?: "blend" | "fbx" | "gltf";
  };
};
```

Notes:
- Scripts are executed exactly as provided
- Order is deterministic
- Invocation does not infer relationships between scripts

---

## Outputs

### Invocation result

```ts
type BlenderInvocationResult = {
  invocationId: string;
  ok: boolean;
  executed: Array<{
    prefabKey: string;
    artefacts: string[];
  }>;
  errors?: Array<{
    prefabKey: string;
    message: string;
    stderr?: string;
  }>;
  warnings?: string[];
};
```

Rules:
- Partial success is allowed
- Errors are reported per prefab
- Invocation does not throw on script-level failure

---

## Execution model

### Script execution

- Each `blenderPython` script is executed in isolation
- Execution order follows input order
- No shared global state between scripts unless explicitly requested later

### Blender process lifecycle

Two supported modes:

#### Headless
- `blender --background --python <script>`
- Used for automation and CI

#### GUI
- `blender --python <script>`
- Used for interactive inspection

Invocation layer must not assume availability of GUI.

---

## File system rules

- Invocation layer may write files **only** to:
  - the provided output directory
  - temporary working directories it creates
- Generators never write files directly
- Paths must be explicit and validated

---

## Error handling

- Blender process failures are captured and returned
- Python exceptions inside Blender are captured
- Invocation layer never retries automatically
- No silent failures

---

## Determinism guarantees

Invocation layer guarantees:

- Same scripts + same Blender version → same results
- No randomisation unless explicitly included in scripts
- No implicit state carried across invocations

---

## Versioning and compatibility

- Invocation layer must log:
  - Blender version
  - Invocation mode
  - Script count
- Compatibility concerns are surfaced as warnings, not hidden

---

## Security considerations

- Invocation layer must treat scripts as trusted input
- No user-supplied scripts are executed directly
- Sandboxing is out of scope for v1

---

## Why this layer is intentionally minimal

The power of artWorkflow lies in **planning and inspection**.

The invocation layer exists only to:
> “Do exactly what was already decided.”

Keeping it minimal ensures:
- Fewer bugs
- Easier debugging
- Clear responsibility boundaries
- Easier replacement or extension later

---

## Future extensions (explicitly deferred)

These are **not part of v1**, but may be added later:

- Script batching
- Shared scenes between prefabs
- Material application
- Scene assembly
- Caching
- Parallel execution
- Undo/redo support

Each of these must be layered *on top of* this spec, not baked into it.

---

## Final note

If you feel tempted to add logic to this layer, stop and ask:

> “Was this decision already made earlier?”

If the answer is yes, this layer should only **execute** it.

If the answer is no, the logic belongs in planning or generation — not here.
