"""Compatibility package for the solution modules.

The source directory is named ``Leetcode-sln`` for readability on disk, but
Python imports cannot contain hyphens. Point this package at that directory so
imports such as ``Leetcode.tree.Leetcode_1123`` work in tests and scripts.
"""

from pathlib import Path

__path__ = [str(Path(__file__).resolve().parent.parent / "Leetcode-sln")]
