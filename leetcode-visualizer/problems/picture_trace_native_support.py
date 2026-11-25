import pathlib,runpy
trace_lesson=runpy.run_path(str(pathlib.Path(__file__).with_name('picture-trace.py')))['picture_trace']
