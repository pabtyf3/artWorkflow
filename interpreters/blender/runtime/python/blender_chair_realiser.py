from __future__ import annotations

from typing import Mapping, Optional, Tuple

try:
    import bpy  # type: ignore
    from mathutils import Vector  # type: ignore
except Exception as exc:  # pragma: no cover - only valid inside Blender
    bpy = None  # type: ignore
    Vector = None  # type: ignore
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

TOLERANCE = 0.02
DEBUG_ASSERT = False
DEBUG_ASSERT_TOLERANCE = 0.005


def _object_world_bounds(
    obj: "bpy.types.Object",
) -> Optional[Tuple[float, float, float, float, float, float]]:
    if obj.type != "MESH":
        return None
    if Vector is None:
        return None
    depsgraph = bpy.context.evaluated_depsgraph_get()
    eval_obj = obj.evaluated_get(depsgraph)
    if not eval_obj:
        return None
    if not eval_obj.bound_box:
        return None
    world_corners = [eval_obj.matrix_world @ Vector(corner) for corner in eval_obj.bound_box]
    xs = [corner.x for corner in world_corners]
    ys = [corner.y for corner in world_corners]
    zs = [corner.z for corner in world_corners]
    return (min(xs), max(xs), min(ys), max(ys), min(zs), max(zs))


def _collection_bounds(
    collection: "bpy.types.Collection",
) -> Optional[Tuple[float, float, float, float, float, float]]:
    bounds: Optional[Tuple[float, float, float, float, float, float]] = None
    for obj in collection.objects:
        obj_bounds = _object_world_bounds(obj)
        if obj_bounds is None:
            continue
        if bounds is None:
            bounds = obj_bounds
            continue
        min_x, max_x, min_y, max_y, min_z, max_z = bounds
        o_min_x, o_max_x, o_min_y, o_max_y, o_min_z, o_max_z = obj_bounds
        bounds = (
            min(min_x, o_min_x),
            max(max_x, o_max_x),
            min(min_y, o_min_y),
            max(max_y, o_max_y),
            min(min_z, o_min_z),
            max(max_z, o_max_z),
        )
    return bounds


def _part_bounds(
    collection: "bpy.types.Collection",
    part_id: str,
) -> Optional[Tuple[float, float, float, float, float, float]]:
    bounds: Optional[Tuple[float, float, float, float, float, float]] = None
    for obj in collection.objects:
        if f"::{part_id}::" not in obj.name:
            continue
        obj_bounds = _object_world_bounds(obj)
        if obj_bounds is None:
            continue
        if bounds is None:
            bounds = obj_bounds
            continue
        min_x, max_x, min_y, max_y, min_z, max_z = bounds
        o_min_x, o_max_x, o_min_y, o_max_y, o_min_z, o_max_z = obj_bounds
        bounds = (
            min(min_x, o_min_x),
            max(max_x, o_max_x),
            min(min_y, o_min_y),
            max(max_y, o_max_y),
            min(min_z, o_min_z),
            max(max_z, o_max_z),
        )
    return bounds


def _check_ergonomics(
    input_dict: Mapping[str, object],
    collection: "bpy.types.Collection",
) -> None:
    if input_dict.get("archetype") != "chair":
        return
    physical = input_dict.get("physical")
    if not isinstance(physical, Mapping):
        return

    collection_bounds = _collection_bounds(collection)
    if collection_bounds is None:
        return
    min_x, max_x, min_y, max_y, min_z, max_z = collection_bounds
    seat_bounds = _part_bounds(collection, "seat")
    if seat_bounds is None:
        return
    _, _, _, _, seat_min_z, seat_max_z = seat_bounds

    # Seat height is measured as the top of the seat surface relative to floor (min Z).
    measured = {
        "seatHeight": seat_max_z - min_z,
        "totalHeight": max_z - min_z,
        "footprint": {
            "width": max_x - min_x,
            "depth": max_y - min_y,
        },
    }

    declared = physical
    declared_seat_height = declared.get("seatHeight")
    declared_total_height = declared.get("totalHeight")
    declared_footprint = declared.get("footprint")

    if DEBUG_ASSERT:
        print("[Ergonomics] Chair declared:", declared)
        print("[Ergonomics] Chair measured:", measured)

    def _compare_metric(metric: str, measured_value: float, declared_value: float) -> None:
        delta = measured_value - declared_value
        if abs(delta) > TOLERANCE:
            print(
                "[Ergonomics] Chair mismatch "
                f"({metric}): measured={measured_value:.4f}, "
                f"declared={declared_value:.4f}, Δ={delta:.4f}"
            )
        if DEBUG_ASSERT and abs(delta) > DEBUG_ASSERT_TOLERANCE:
            raise AssertionError(
                "[Ergonomics] Chair mismatch "
                f"({metric}): measured={measured_value:.4f}, "
                f"declared={declared_value:.4f}, Δ={delta:.4f}"
            )

    comparisons = []
    if isinstance(declared_seat_height, (int, float)):
        comparisons.append(("seatHeight", measured["seatHeight"], declared_seat_height))
    if isinstance(declared_total_height, (int, float)):
        comparisons.append(
            ("totalHeight", measured["totalHeight"], declared_total_height)
        )
    if isinstance(declared_footprint, Mapping):
        declared_width = declared_footprint.get("width")
        declared_depth = declared_footprint.get("depth")
        if isinstance(declared_width, (int, float)):
            comparisons.append(
                ("footprint.width", measured["footprint"]["width"], declared_width)
            )
        if isinstance(declared_depth, (int, float)):
            comparisons.append(
                ("footprint.depth", measured["footprint"]["depth"], declared_depth)
            )

    for metric, measured_value, declared_value in comparisons:
        _compare_metric(metric, measured_value, declared_value)


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

    _check_ergonomics(input_dict, collection)
