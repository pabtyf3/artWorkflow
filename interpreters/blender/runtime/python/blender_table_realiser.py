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

PART_OBJECT_COUNTS = {
    "supports": 4,
}

REALISER_TOLERANCE = 0.002  # 2mm structural clearance


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


def realise_table(input_dict: Mapping[str, object]) -> None:
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

    surface_scale: Optional[Tuple[float, float, float]] = None
    support_scale: Optional[Tuple[float, float, float]] = None
    surface_height_value: Optional[float] = None
    surface_width_value: Optional[float] = None
    surface_depth_value: Optional[float] = None
    leg_thickness_value: Optional[float] = None

    def _get_number(value: object) -> Optional[float]:
        if isinstance(value, (int, float)):
            return float(value)
        return None

    if isinstance(physical, Mapping):
        surface_width = _get_number(physical.get("surfaceWidth"))
        surface_depth = _get_number(physical.get("surfaceDepth"))
        surface_height = _get_number(physical.get("surfaceHeight"))

        surface_width_value = surface_width
        surface_depth_value = surface_depth
        surface_height_value = surface_height

        if surface_width is not None:
            leg_thickness_value = surface_width * 0.05

        if surface_width is not None and surface_depth is not None:
            surface_thickness = min(surface_width, surface_depth) * 0.08
            surface_scale = (surface_width, surface_depth, surface_thickness)

        if leg_thickness_value is not None and surface_height is not None:
            support_scale = (
                leg_thickness_value,
                leg_thickness_value,
                surface_height - REALISER_TOLERANCE,
            )

    support_positions: Optional[list[Tuple[float, float]]] = None
    if (
        surface_width_value is not None
        and surface_depth_value is not None
        and leg_thickness_value is not None
    ):
        half_surface_w = surface_width_value / 2
        half_surface_d = surface_depth_value / 2
        half_leg = leg_thickness_value / 2
        LEG_INSET = REALISER_TOLERANCE * 5
        support_positions = [
            (-half_surface_w + half_leg + LEG_INSET, -half_surface_d + half_leg + LEG_INSET),
            (half_surface_w - half_leg - LEG_INSET, -half_surface_d + half_leg + LEG_INSET),
            (-half_surface_w + half_leg + LEG_INSET, half_surface_d - half_leg - LEG_INSET),
            (half_surface_w - half_leg - LEG_INSET, half_surface_d - half_leg - LEG_INSET),
        ]

    for index, part in enumerate(summary.parts):
        base_x = index * 2.0
        base_y = 0.0
        base_z = 0.0

        if part.id == "surface":
            base_x = 0.0
            base_y = 0.0
        elif part.id == "supports" and support_positions is not None:
            base_x = 0.0
            base_y = 0.0

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

            offset_z = 0.0
            if part.id == "surface" and surface_scale is not None:
                cube.scale = surface_scale
                if surface_height_value is not None:
                    offset_z = surface_height_value + (surface_scale[2] / 2)
            elif part.id == "supports" and support_scale is not None:
                cube.scale = support_scale
                offset_z = support_scale[2] / 2

            if part.id != "supports" or support_positions is None:
                cube.location = (0.0, offset_y, offset_z)
            else:
                cube.location = (cube.location.x, cube.location.y, offset_z)

            cube.parent = anchor

    _collection_bounds(collection)
