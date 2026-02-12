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

REALISER_TOLERANCE = 0.002  # 2mm structural clearance
APPLY_ERGONOMICS = True
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
    asset_id = input_dict.get("assetId")
    if input_dict.get("archetype") != "chair":
        return
    physical = input_dict.get("physical")
    if not isinstance(physical, Mapping):
        return

    def _measure_chair() -> Optional[Mapping[str, object]]:
        collection_bounds = _collection_bounds(collection)
        if collection_bounds is None:
            return None
        min_x, max_x, min_y, max_y, min_z, max_z = collection_bounds
        seat_bounds = _part_bounds(collection, "seat")
        if seat_bounds is None:
            return None
        _, _, _, _, _seat_min_z, seat_max_z = seat_bounds
        # Seat height is measured as the top of the seat surface relative to floor (min Z).
        return {
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

    def _compare(measured: Mapping[str, object]) -> None:
        comparisons = []
        if isinstance(declared_seat_height, (int, float)):
            comparisons.append(
                ("seatHeight", measured["seatHeight"], declared_seat_height)
            )
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

    def _apply_z_offset_to_part(
        asset_id: str,
        part_id: str,
        delta_z: float,
    ) -> None:
        anchor_name = f"{asset_id}::{part_id}::ANCHOR"
        anchor_obj = bpy.data.objects.get(anchor_name)
        if anchor_obj is not None:
            anchor_obj.location.z += delta_z
            return
        for obj in collection.objects:
            if f"::{part_id}::" not in obj.name:
                continue
            obj.location.z += delta_z

    measured_before = _measure_chair()
    if measured_before is None:
        return

    if DEBUG_ASSERT:
        print("[Ergonomics] Chair declared:", declared)
        print("[Ergonomics] Chair measured:", measured_before)

    if APPLY_ERGONOMICS:
        seat_delta = 0.0
        total_delta = 0.0
        if isinstance(declared_seat_height, (int, float)):
            seat_delta = declared_seat_height - measured_before["seatHeight"]
            _apply_z_offset_to_part(asset_id, "seat", seat_delta)
        if isinstance(declared_total_height, (int, float)):
            total_delta = declared_total_height - measured_before["totalHeight"]
            _apply_z_offset_to_part(asset_id, "back", total_delta)

        measured_after = _measure_chair()
        if measured_after is None:
            return
        if DEBUG_ASSERT:
            print(
                "[Ergonomics] Chair seatHeight corrected: "
                f"{measured_before['seatHeight']:.4f} → {measured_after['seatHeight']:.4f}"
            )
            print(
                "[Ergonomics] Chair totalHeight corrected: "
                f"{measured_before['totalHeight']:.4f} → {measured_after['totalHeight']:.4f}"
            )
            print("[Ergonomics] Chair measured:", measured_after)
        _compare(measured_after)
        return

    _compare(measured_before)


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

    physical = input_dict.get("physical")

    footprint_width: Optional[float] = None
    footprint_depth: Optional[float] = None
    seat_width_value: Optional[float] = None
    seat_depth_value: Optional[float] = None
    leg_thickness_value: Optional[float] = None
    back_thickness_value: Optional[float] = None

    def _get_number(value: object) -> Optional[float]:
        if isinstance(value, (int, float)):
            return float(value)
        return None

    seat_scale: Optional[Tuple[float, float, float]] = None
    back_scale: Optional[Tuple[float, float, float]] = None
    support_scale: Optional[Tuple[float, float, float]] = None
    seat_height_value: Optional[float] = None
    back_depth = 0.1

    if isinstance(physical, Mapping):
        seat_width = _get_number(physical.get("seatWidth"))
        seat_depth = _get_number(physical.get("seatDepth"))
        seat_width_value = seat_width
        seat_depth_value = seat_depth
        footprint = physical.get("footprint")
        if isinstance(footprint, Mapping):
            footprint_width = _get_number(footprint.get("width"))
            footprint_depth = _get_number(footprint.get("depth"))
        total_height = _get_number(physical.get("totalHeight"))
        seat_height = _get_number(physical.get("seatHeight"))
        seat_height_value = seat_height

        leg_thickness = None
        if footprint_width is not None and seat_width is not None:
            leg_thickness = (footprint_width - seat_width) / 2
            leg_thickness_value = leg_thickness

        seat_thickness = None
        if seat_width is not None:
            seat_thickness = seat_width * 0.08

        back_width = None
        back_thickness = None
        back_height = None

        if seat_width is not None:
            back_width = seat_width * 0.9

        if seat_thickness is not None:
            back_thickness = seat_thickness * 0.8
            back_thickness_value = back_thickness

        if total_height is not None and seat_height is not None:
            back_height = total_height - seat_height

        if seat_width is not None and seat_depth is not None and seat_thickness is not None:
            seat_scale = (seat_width, seat_depth, seat_thickness)
        if leg_thickness is not None and seat_height is not None:
            support_scale = (
                leg_thickness,
                leg_thickness,
                seat_height - REALISER_TOLERANCE,
            )
        if back_width is not None and back_thickness is not None and back_height is not None:
            back_scale = (back_width, back_thickness, back_height)
            back_depth = back_thickness

    if REGEN_MODE == "replace":
        for obj in list(collection.objects):
            bpy.data.objects.remove(obj, do_unlink=True)

    support_positions: Optional[list[Tuple[float, float]]] = None
    if (
        seat_width_value is not None
        and seat_depth_value is not None
        and leg_thickness_value is not None
    ):
        half_seat_w = seat_width_value / 2
        half_seat_d = seat_depth_value / 2
        half_leg = leg_thickness_value / 2
        LEG_INSET = seat_width_value * 0.015
        support_positions = [
            (-half_seat_w + half_leg + LEG_INSET, -half_seat_d + half_leg + LEG_INSET),
            (half_seat_w - half_leg - LEG_INSET, -half_seat_d + half_leg + LEG_INSET),
            (-half_seat_w + half_leg + LEG_INSET, half_seat_d - half_leg - LEG_INSET),
            (half_seat_w - half_leg - LEG_INSET, half_seat_d - half_leg - LEG_INSET),
        ]

    for index, part in enumerate(summary.parts):
        base_x = index * PART_SPACING
        base_y = 0.0
        base_z = 0.0

        if seat_depth_value is not None and back_thickness_value is not None:
            if part.id == "seat":
                base_x = 0.0
                base_y = 0.0
            elif part.id == "back":
                base_x = 0.0
                base_y = (seat_depth_value / 2) - (back_thickness_value / 2)
            elif part.id == "supports" and support_positions is not None:
                base_x = 0.0
                base_y = 0.0
        elif part.id == "seat":
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
            if part.id == "supports" and support_positions is not None:
                if sub_index < len(support_positions):
                    offset_y = support_positions[sub_index][1]
                    cube.location = (support_positions[sub_index][0], offset_y, 0.0)
            elif part.id == "supports":
                offset_y = sub_index * SUPPORT_SPACING
            offset_z = 0.0
            if part.id == "seat" and seat_scale is not None:
                cube.scale = seat_scale
                if seat_height_value is not None:
                    offset_z = seat_height_value + (seat_scale[2] / 2)
                else:
                    offset_z = -seat_scale[2] / 2
            elif part.id == "back" and back_scale is not None:
                cube.scale = back_scale
                offset_z = back_scale[2] / 2
            elif part.id == "supports" and support_scale is not None:
                cube.scale = support_scale
                offset_z = support_scale[2] / 2
            if part.id != "supports" or support_positions is None:
                cube.location = (0.0, offset_y, offset_z)
            else:
                cube.location = (cube.location.x, cube.location.y, offset_z)
            cube.parent = anchor

    _check_ergonomics(input_dict, collection)
