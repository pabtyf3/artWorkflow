from __future__ import annotations

from typing import Mapping

try:
    import bpy  # type: ignore
except Exception as exc:  # pragma: no cover - only valid inside Blender
    bpy = None  # type: ignore
    _BLENDER_IMPORT_ERROR = exc
else:
    _BLENDER_IMPORT_ERROR = None

from .blender_debug_adapter import debug_adapter_summary

PART_SPACING = 2.0

SEAT_HEIGHT = 1.0
BACK_OFFSET = -1.0
SUPPORT_SPACING = 1.0

REGEN_MODE = "preserve"

PART_OBJECT_COUNTS = {
    "supports": 4,
}


def realise_chair(input_dict: Mapping[str, object]) -> None:
    """
    Minimal Blender-side chair realiser.
    Uses the same traversal as the debug adapter and creates empty placeholders
    to reflect part presence without adding geometry.
    """
    if bpy is None:
        raise RuntimeError(
            "Blender runtime not available; this realiser must run inside Blender."
        ) from _BLENDER_IMPORT_ERROR

    summary = debug_adapter_summary(input_dict)
    collection_name = summary.assetId

    collection = bpy.data.collections.get(collection_name)
    if collection is None:
        collection = bpy.data.collections.new(collection_name)
        bpy.context.scene.collection.children.link(collection)

    vertices = [
        (-0.5, -0.5, -0.5),
        (0.5, -0.5, -0.5),
        (0.5, 0.5, -0.5),
        (-0.5, 0.5, -0.5),
        (-0.5, -0.5, 0.5),
        (0.5, -0.5, 0.5),
        (0.5, 0.5, 0.5),
        (-0.5, 0.5, 0.5),
    ]
    faces = [
        (0, 1, 2, 3),
        (4, 5, 6, 7),
        (0, 1, 5, 4),
        (1, 2, 6, 5),
        (2, 3, 7, 6),
        (3, 0, 4, 7),
    ]
    cube_mesh = bpy.data.meshes.get("__unit_cube__")
    if cube_mesh is None:
        cube_mesh = bpy.data.meshes.new("__unit_cube__")
        cube_mesh.from_pydata(vertices, [], faces)
        cube_mesh.update()

    if REGEN_MODE == "replace":
        for obj in list(collection.objects):
            bpy.data.objects.remove(obj, do_unlink=True)

    for index, part in enumerate(summary.parts):
        base_x = index * PART_SPACING
        base_y = 0.0
        base_z = 0.0

        if part.id == "seat":
            base_z = SEAT_HEIGHT
        elif part.id == "back":
            base_z = SEAT_HEIGHT
            base_y = BACK_OFFSET
        object_count = PART_OBJECT_COUNTS.get(part.id, 1)

        anchor_name = f"{summary.assetId}::{part.id}::ANCHOR"
        anchor = bpy.data.objects.get(anchor_name)
        if anchor is None:
            anchor = bpy.data.objects.new(anchor_name, None)
            collection.objects.link(anchor)
        anchor.location = (base_x, base_y, base_z)

        for sub_index in range(object_count):
            obj_name = f"{summary.assetId}::{part.id}::{sub_index}"
            if obj_name in bpy.data.objects:
                continue

            cube = bpy.data.objects.new(obj_name, cube_mesh)
            collection.objects.link(cube)
            offset_y = 0.0
            if part.id == "supports":
                offset_y = sub_index * SUPPORT_SPACING
            cube.location = (0.0, offset_y, 0.0)
            cube.parent = anchor
