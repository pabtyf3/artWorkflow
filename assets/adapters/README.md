# Adapter Inputs

`buildAdapterInput` is the canonical boundary where semantic intent becomes
physical, ergonomic dimensions. Chair assets must be routed through this
builder so ergonomics is applied exactly once. Upstream generators emit
semantic intent only and must not resolve dimensions. Downstream interpreters
must treat `physical` as opaque and must not adjust scale or ergonomics.

This boundary keeps regeneration deterministic and prevents ergonomics logic
from leaking into Blender or scene tooling.
