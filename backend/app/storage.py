from pathlib import Path

from app.models import Analysis


def delete_video_file(analysis: Analysis) -> None:
    # missing_ok: brak pliku (np. usunięty ręcznie) nie może blokować usunięcia wpisu z bazy.
    if analysis.video_path:
        Path(analysis.video_path).unlink(missing_ok=True)
