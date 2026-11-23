from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.models import AnalysisStatus


class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UpdateProfileRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=80)
    email: EmailStr | None = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=128)


class UserResponse(BaseModel):
    id: int
    name: str
    email: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class AnalysisResponse(BaseModel):
    id: str
    name: str
    status: AnalysisStatus
    progress: int
    created_at: datetime
    duration_s: float | None
    video_url: str
    result: dict | None
    error: str | None


class AnalysisListResponse(BaseModel):
    items: list[AnalysisResponse]
    total: int
