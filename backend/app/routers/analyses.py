from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlmodel import Session, desc, func, select

from app.analysis import run_analysis
from app.config import settings
from app.db import get_session
from app.models import Analysis
from app.schemas import AnalysisListResponse, AnalysisResponse
from app.security import CurrentUser
from app.storage import delete_video_file
from app.video import read_duration_seconds

router = APIRouter(prefix="/analyses", tags=["analyses"])

SessionDep = Annotated[Session, Depends(get_session)]
BYTES_PER_MB = 1024 * 1024


def _to_response(analysis: Analysis) -> AnalysisResponse:
    return AnalysisResponse(
        id=analysis.id,
        name=analysis.name,
        status=analysis.status,
        progress=analysis.progress,
        created_at=analysis.created_at,
        duration_s=analysis.duration_s,
        video_url=f"/api/v1/analyses/{analysis.id}/video",
        result=analysis.result,
        error=analysis.error,
    )


def _get_owned_analysis(session: Session, analysis_id: str, user_id: int) -> Analysis:
    analysis = session.get(Analysis, analysis_id)
    if analysis is None or analysis.user_id != user_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Nie znaleziono analizy.")
    return analysis


def _save_upload(file: UploadFile, destination: Path) -> None:
    max_bytes = settings.max_video_megabytes * BYTES_PER_MB
    written = 0
    with destination.open("wb") as target:
        while chunk := file.file.read(BYTES_PER_MB):
            written += len(chunk)
            if written > max_bytes:
                target.close()
                destination.unlink(missing_ok=True)
                raise HTTPException(
                    status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"Plik jest większy niż {settings.max_video_megabytes} MB.",
                )
            target.write(chunk)


@router.post("", response_model=AnalysisResponse, status_code=status.HTTP_202_ACCEPTED)
def create_analysis(
    user: CurrentUser,
    session: SessionDep,
    background_tasks: BackgroundTasks,
    file: Annotated[UploadFile, File()],
    name: Annotated[str | None, Form()] = None,
) -> AnalysisResponse:
    original_name = Path(file.filename or "film").name
    extension = Path(original_name).suffix.lower()
    if extension not in settings.allowed_video_extensions:
        allowed = ", ".join(ext.lstrip(".").upper() for ext in settings.allowed_video_extensions)
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"Dozwolone formaty: {allowed}.")

    analysis = Analysis(
        user_id=user.id,
        name=(name or Path(original_name).stem).strip(),
        original_filename=original_name,
        video_path="",
    )
    video_path = settings.uploads_dir / f"{analysis.id}{extension}"
    _save_upload(file, video_path)

    duration = read_duration_seconds(video_path)
    if duration is not None and duration > settings.max_video_seconds:
        video_path.unlink(missing_ok=True)
        limit = f"{settings.max_video_seconds // 60}:{settings.max_video_seconds % 60:02d}"
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"Film może trwać maksymalnie {limit} min.")

    analysis.video_path = str(video_path)
    analysis.duration_s = duration
    session.add(analysis)
    session.commit()
    session.refresh(analysis)

    background_tasks.add_task(run_analysis, analysis.id)
    return _to_response(analysis)


@router.get("", response_model=AnalysisListResponse)
def list_analyses(user: CurrentUser, session: SessionDep, limit: int = 20, offset: int = 0) -> AnalysisListResponse:
    query = select(Analysis).where(Analysis.user_id == user.id)
    total = session.exec(select(func.count()).select_from(query.subquery())).one()
    items = session.exec(query.order_by(desc(Analysis.created_at)).offset(offset).limit(limit)).all()
    return AnalysisListResponse(items=[_to_response(a) for a in items], total=total)


@router.get("/{analysis_id}", response_model=AnalysisResponse)
def get_analysis(analysis_id: str, user: CurrentUser, session: SessionDep) -> AnalysisResponse:
    return _to_response(_get_owned_analysis(session, analysis_id, user.id))


@router.delete("/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_analysis(analysis_id: str, user: CurrentUser, session: SessionDep) -> None:
    analysis = _get_owned_analysis(session, analysis_id, user.id)
    delete_video_file(analysis)
    session.delete(analysis)
    session.commit()


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def delete_all_analyses(user: CurrentUser, session: SessionDep) -> None:
    for analysis in session.exec(select(Analysis).where(Analysis.user_id == user.id)).all():
        delete_video_file(analysis)
        session.delete(analysis)
    session.commit()


# Bez logowania: <video src> w przeglądarce nie wysyła nagłówka Authorization.
# Na MVP wystarcza trudny do zgadnięcia identyfikator analizy.
@router.get("/{analysis_id}/video")
def get_video(analysis_id: str, session: SessionDep) -> FileResponse:
    analysis = session.get(Analysis, analysis_id)
    if analysis is None or not Path(analysis.video_path).exists():
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Nie znaleziono filmu.")
    return FileResponse(analysis.video_path, filename=analysis.original_filename)
