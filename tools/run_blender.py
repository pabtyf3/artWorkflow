from __future__ import annotations

import json
import os
import sys

import bpy  # type: ignore


def _parse_args(argv: list[str]) -> tuple[str, str]:
    if "--" not in argv:
        raise ValueError("Missing '--' separator for Blender arguments.")
    sep_index = argv.index("--")
    args = argv[sep_index + 1 :]
    if len(args) < 2:
        raise ValueError("Expected input and output paths after '--'.")
    return args[0], args[1]


def main() -> None:
    input_path, output_path = _parse_args(sys.argv)

    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    
    
    if repo_root not in sys.path:
        sys.path.insert(0, repo_root)

    # Remove default mesh objects (e.g. Blender startup cube)
    for obj in list(bpy.data.objects):
        if obj.type == "MESH":
            bpy.data.objects.remove(obj, do_unlink=True)

    with open(input_path, "r", encoding="utf-8") as handle:
        adapter_input = json.load(handle)

    from interpreters.blender.runtime.python.blender_chair_realiser import (
        realise_chair,
    )

    realise_chair(adapter_input)

    bpy.ops.wm.save_mainfile(filepath=output_path)


if __name__ == "__main__":
    main()
