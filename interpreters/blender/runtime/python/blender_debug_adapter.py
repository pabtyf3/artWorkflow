from __future__ import annotations

from dataclasses import dataclass
from typing import  List, Mapping


@dataclass(frozen=True)
class PartEntry:
    id: str
    kind: str


@dataclass(frozen=True)
class DebugAdapterSummary:
    assetId: str
    archetype: str
    detailTier: str
    parts: List[PartEntry]


def normalize_parts(parts: Mapping[str, Mapping[str, str]]) -> List[PartEntry]:
    return [PartEntry(id=part_id, kind=parts[part_id]["kind"]) for part_id in sorted(parts.keys())]


def debug_adapter_summary(input_dict: Mapping[str, object]) -> DebugAdapterSummary:
    parts = normalize_parts(input_dict["parts"])  # type: ignore[index]
    return DebugAdapterSummary(
        assetId=input_dict["assetId"],  # type: ignore[index]
        archetype=input_dict["archetype"],  # type: ignore[index]
        detailTier=input_dict["detailTier"],  # type: ignore[index]
        parts=parts,
    )


def debug_adapter_ascii(input_dict: Mapping[str, object]) -> str:
    summary = debug_adapter_summary(input_dict)
    lines: List[str] = [
        f"asset: {summary.assetId}",
        f"archetype: {summary.archetype}",
        f"detailTier: {summary.detailTier}",
        "parts:",
    ]
    for part in summary.parts:
        lines.append(f"- {part.id} ({part.kind})")
    return "\n".join(lines)


def run_debug_adapter(input_dict: Mapping[str, object]) -> None:
    print(debug_adapter_ascii(input_dict))
