from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.db import get_session
from app.models import Analysis, User
from app.schemas import (
    ChangePasswordRequest,
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UpdateProfileRequest,
    UserResponse,
)
from app.security import CurrentUser, create_access_token, hash_password, verify_password
from app.storage import delete_video_file

router = APIRouter(tags=["auth"])

SessionDep = Annotated[Session, Depends(get_session)]


def _user_response(user: User) -> UserResponse:
    return UserResponse(id=user.id, name=user.name, email=user.email)


def _email_taken(session: Session, email: str, except_user_id: int | None = None) -> bool:
    existing = session.exec(select(User).where(User.email == email)).first()
    return existing is not None and existing.id != except_user_id


def _token_response(user: User) -> TokenResponse:
    return TokenResponse(
        access_token=create_access_token(user.id),
        user=_user_response(user),
    )


@router.post("/auth/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, session: SessionDep) -> TokenResponse:
    email = body.email.lower()
    if _email_taken(session, email):
        raise HTTPException(status.HTTP_409_CONFLICT, detail="Konto z tym adresem email już istnieje.")

    user = User(name=body.name.strip(), email=email, password_hash=hash_password(body.password))
    session.add(user)
    session.commit()
    session.refresh(user)
    return _token_response(user)


@router.post("/auth/login", response_model=TokenResponse)
def login(body: LoginRequest, session: SessionDep) -> TokenResponse:
    user = session.exec(select(User).where(User.email == body.email.lower())).first()
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Nieprawidłowy email lub hasło.")
    return _token_response(user)


@router.get("/users/me", response_model=UserResponse)
def me(user: CurrentUser) -> UserResponse:
    return _user_response(user)


@router.patch("/users/me", response_model=UserResponse)
def update_profile(body: UpdateProfileRequest, user: CurrentUser, session: SessionDep) -> UserResponse:
    if body.email is not None:
        email = body.email.lower()
        if _email_taken(session, email, except_user_id=user.id):
            raise HTTPException(status.HTTP_409_CONFLICT, detail="Konto z tym adresem email już istnieje.")
        user.email = email
    if body.name is not None:
        user.name = body.name.strip()
    session.add(user)
    session.commit()
    session.refresh(user)
    return _user_response(user)


@router.post("/users/me/password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(body: ChangePasswordRequest, user: CurrentUser, session: SessionDep) -> None:
    if not verify_password(body.current_password, user.password_hash):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Obecne hasło jest nieprawidłowe.")
    user.password_hash = hash_password(body.new_password)
    session.add(user)
    session.commit()


@router.delete("/users/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(user: CurrentUser, session: SessionDep) -> None:
    for analysis in session.exec(select(Analysis).where(Analysis.user_id == user.id)).all():
        delete_video_file(analysis)
        session.delete(analysis)
    session.delete(user)
    session.commit()
