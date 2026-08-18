"""Compatibility import for the relocated LeetCode 152 solution."""

from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

_SOURCE = Path(__file__).resolve().parent.parent / "dynamic-programming" / "Leetcode_152.py"
_SPEC = spec_from_file_location("_leetcode_152_impl", _SOURCE)
if _SPEC is None or _SPEC.loader is None:
    raise ImportError(f"Unable to load solution module: {_SOURCE}")

_MODULE = module_from_spec(_SPEC)
_SPEC.loader.exec_module(_MODULE)

Solution = _MODULE.Solution

__all__ = ["Solution"]
