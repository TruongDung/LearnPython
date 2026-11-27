SortedContainers 2.4.0 is bundled unmodified for the TaskManager SortedList lesson,
its Python trace worker, and the live editor. No package download is needed during execution.

- Project: https://github.com/grantjenks/python-sortedcontainers
- Distribution: https://cdn.jsdelivr.net/pyodide/v0.26.4/full/
  (Pyodide-packaged SortedContainers 2.4.0)
- File: sortedcontainers-2.4.0-py2.py3-none-any.whl
- SHA-256: 5783a606c1be930949245afeae64401b9be3cb038fc24d851d3eaf8913555d6e
- License: Apache-2.0; the original LICENSE is included in the wheel.


Native-lesson fallback packages
-------------------------------

The unmodified NumPy, Pandas, python-dateutil, pytz, six and SQLite distributions
for Pyodide 0.26.4 are bundled here for serverless execution without native
Python or runtime downloads. SortedContainers is shared with the existing
worker. Exact filenames, dependency versions and SHA-256 checksums are recorded
in `python-packages.json` and verified against Pyodide's pinned lock file.

Source: https://cdn.jsdelivr.net/pyodide/v0.26.4/full/
Pyodide packaging: https://github.com/pyodide/pyodide/tree/0.26.4/packages
Each wheel retains its original license notices in its dist-info directory;
the SQLite package retains its bundled upstream notices.
