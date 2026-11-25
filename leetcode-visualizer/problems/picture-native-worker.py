"""Persistent local interpreter for lessons requiring native Python packages."""
import contextlib,json,pathlib,sys,traceback,base64,zlib
from picture_trace_native_support import trace_lesson
for line in sys.stdin:
    try:
        payload=json.loads(line)
        with contextlib.redirect_stdout(sys.stderr):
            result=trace_lesson(payload)
        print(json.dumps({'data':base64.b64encode(zlib.compress(result.encode())).decode()}),flush=True)
    except Exception:
        print(json.dumps({'error':traceback.format_exc()}),flush=True)
