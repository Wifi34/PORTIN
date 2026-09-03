from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
import secrets
from backend.app.database.session import get_db
from backend.app.models.models import User, AuditLog
from backend.app.schemas.schemas import (
    UserCreate, UserLogin, Token, TokenRefresh, UserResponse,
    PasswordResetRequest, PasswordResetConfirm
)
from backend.app.core.security import (
    verify_password, get_password_hash, create_access_token,
    create_refresh_token, decode_token
)
from backend.app.core.deps import get_current_user

router = APIRouter()

# Temporary in-memory reset token storage for local SIH development
_reset_tokens = {}

@router.post("/register", response_model=UserResponse)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    if not user_in.accept_terms:
        raise HTTPException(status_code=400, detail="You must accept terms and conditions to register.")
    
    # Check if email already exists
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    # Guard against admin escalation
    if user_in.role == "admin":
        raise HTTPException(status_code=403, detail="Self-registration as administrator is not permitted.")

    new_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        organization=user_in.organization,
        role=user_in.role,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Log action
    audit = AuditLog(user_id=new_user.id, action="USER_REGISTER", resource="User", details=f"New user registered: {new_user.email}")
    db.add(audit)
    db.commit()

    return new_user

@router.post("/login", response_model=Token)
def login_user(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is deactivated.")

    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "organization": user.organization,
            "role": user.role
        }
    }

@router.post("/refresh", response_model=Token)
def refresh_token(payload: TokenRefresh, db: Session = Depends(get_db)):
    decoded = decode_token(payload.refresh_token)
    if not decoded or decoded.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    
    user_id = decoded.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    access_token = create_access_token(subject=user.id)
    new_refresh = create_refresh_token(subject=user.id)

    return {
        "access_token": access_token,
        "refresh_token": new_refresh,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "organization": user.organization,
            "role": user.role
        }
    }

@router.post("/forgot-password")
def forgot_password(req: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        return {"message": "If that email exists, a password reset token has been issued.", "demo_token": None}
    
    token = secrets.token_hex(8)
    _reset_tokens[req.email] = token

    from backend.app.services.email import EmailService
    email_sent = EmailService.send_password_reset_email(req.email, token)

    return {
        "message": "Password reset token generated." + (" Email delivered via Gmail SMTP." if email_sent else " SMTP unconfigured, use token below."),
        "email_sent": email_sent,
        "demo_reset_token": token,
        "instruction": "Enter this token on the Reset Password page."
    }

@router.post("/reset-password")
def reset_password(req: PasswordResetConfirm, db: Session = Depends(get_db)):
    stored_token = _reset_tokens.get(req.email)
    if not stored_token or stored_token != req.token:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")

    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.hashed_password = get_password_hash(req.new_password)
    db.commit()
    _reset_tokens.pop(req.email, None)

    return {"message": "Password has been successfully reset. You may now log in."}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
def update_me(full_name: str, organization: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.full_name = full_name
    current_user.organization = organization
    db.commit()
    db.refresh(current_user)
    return current_user
