"""Hjälp för API-testerna: starta den riktiga servern och anropa den.

Servern (uvicorn) startas mot en databasfil som testet anger, oftast i tmp_path.
Den riktiga databasen (app/data/nors.db) rörs inte.
"""

import json
import os
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.request
from contextlib import contextmanager
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
# Väntar bara tills servern svarar. Gränsen märks först när servern inte startar.
STARTTID_SEKUNDER = 60


def _ledig_port() -> int:
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def anrop(
    url: str, data: dict | None = None, method: str | None = None
) -> tuple[int, object]:
    """Anropa API:t och returnera statuskod och JSON, även vid 4xx."""
    body = json.dumps(data).encode() if data is not None else None
    request = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json"},
        method=method,
    )
    try:
        with urllib.request.urlopen(request, timeout=5) as response:
            return response.status, json.loads(response.read())
    except urllib.error.HTTPError as error:
        if error.code >= 500:
            raise
        return error.code, json.loads(error.read())


def _stoppa(process: subprocess.Popen) -> str:
    process.terminate()
    try:
        _, stderr = process.communicate(timeout=10)
    except subprocess.TimeoutExpired:
        process.kill()
        _, stderr = process.communicate()
    return stderr.decode(errors="replace")


@contextmanager
def kor_server(db_path: Path):
    port = _ledig_port()
    process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app",
         "--port", str(port), "--log-level", "warning"],
        cwd=BACKEND_DIR,
        env={**os.environ, "NORS_DB_PATH": str(db_path)},
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
    )
    url = f"http://127.0.0.1:{port}"
    try:
        deadline = time.monotonic() + STARTTID_SEKUNDER
        while True:
            if process.poll() is not None:
                raise RuntimeError(f"Servern avslutades vid start:\n{_stoppa(process)}")
            try:
                anrop(f"{url}/health")
                break
            except OSError:
                if time.monotonic() > deadline:
                    raise RuntimeError(
                        f"Servern svarade inte inom {STARTTID_SEKUNDER} s:\n{_stoppa(process)}"
                    )
                time.sleep(0.1)
        yield url
    finally:
        if process.poll() is None:
            _stoppa(process)
