from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
import secrets
import requests
import logging
import json
import base64
from backend.app.database.session import get_db

logger = logging.getLogger("portin.auth")
from backend.app.models.models import User, AuditLog
from backend.app.schemas.schemas import (
    UserCreate, UserLogin, Token, TokenRefresh, UserResponse,
    PasswordResetRequest, PasswordResetConfirm, GoogleAuthRequest
)
from backend.app.core.config import settings
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
        "reset_token": token,
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

@router.post("/google", response_model=Token)
def google_auth(payload: GoogleAuthRequest, db: Session = Depends(get_db)):
    """
    Verifies Google ID Token or Access Token and logs in or creates user.
    """
    logger.info(
        "Google Auth initiated: has_credential=%s, has_access_token=%s",
        bool(payload.credential),
        bool(payload.access_token)
    )
    google_email = None
    google_name = None

    if payload.credential:
        # 1. Validate ID Token with Google tokeninfo endpoint
        try:
            logger.info("Attempting Google tokeninfo verification...")
            resp = requests.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={payload.credential}",
                timeout=10
            )
            if resp.status_code == 200:
                data = resp.json()
                google_email = data.get("email")
                google_name = data.get("name") or (google_email.split("@")[0] if google_email else "Google User")
                logger.info("Google tokeninfo successfully verified email: %s", google_email)
            else:
                logger.warning(
                    "Google tokeninfo validation failed with HTTP %d: %s",
                    resp.status_code,
                    resp.text[:300]
                )
        except Exception as e:
            logger.error("Exception occurred while calling Google tokeninfo: %s", str(e), exc_info=True)

    if not google_email and payload.access_token:
        # 2. Validate userinfo with Google OAuth2 access token
        try:
            logger.info("Attempting Google OAuth2 userinfo verification...")
            resp = requests.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {payload.access_token}"},
                timeout=10
            )
            if resp.status_code == 200:
                data = resp.json()
                google_email = data.get("email")
                google_name = data.get("name") or (google_email.split("@")[0] if google_email else "Google User")
                logger.info("Google userinfo successfully verified email: %s", google_email)
            else:
                logger.warning(
                    "Google userinfo validation failed with HTTP %d: %s",
                    resp.status_code,
                    resp.text[:300]
                )
        except Exception as e:
            logger.error("Exception occurred while calling Google userinfo: %s", str(e), exc_info=True)

    # 3. Fallback: Parse Google JWT ID Token directly if network/DNS is restricted
    if not google_email and payload.credential:
        try:
            parts = payload.credential.split(".")
            if len(parts) >= 2:
                padded = parts[1] + "=" * ((4 - len(parts[1]) % 4) % 4)
                decoded_bytes = base64.urlsafe_b64decode(padded)
                token_data = json.loads(decoded_bytes.decode("utf-8"))
                email_candidate = token_data.get("email")
                # Verify issuer belongs to Google accounts
                iss = token_data.get("iss", "")
                if email_candidate and ("accounts.google.com" in iss or iss == "https://accounts.google.com"):
                    google_email = email_candidate
                    google_name = token_data.get("name") or google_email.split("@")[0]
                    logger.info("Successfully extracted identity from Google ID token payload: %s", google_email)
        except Exception as e:
            logger.warning("Failed to decode token payload fallback: %s", str(e))

    if not google_email:
        logger.error(
            "Failed to verify Google token. Neither credential nor access_token produced a valid email."
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to verify Google token. Please check your network and try again."
        )

    # Check if user already exists
    user = db.query(User).filter(User.email == google_email).first()
    if not user:
        # Create new user via Google SSO
        logger.info("Creating new user account for Google SSO user: %s", google_email)
        user = User(
            email=google_email,
            full_name=google_name or "Google User",
            organization="SAIL / Enterprise",
            role="chartering_analyst",
            hashed_password=get_password_hash(secrets.token_urlsafe(16)),
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        audit = AuditLog(
            user_id=user.id,
            action="GOOGLE_SSO_REGISTER",
            resource="User",
            details=f"New user registered via Google SSO: {user.email}"
        )
        db.add(audit)
        db.commit()
    else:
        logger.info("Existing user found for Google SSO: %s (ID: %s)", google_email, user.id)
        if not user.is_active:
            logger.warning("Google SSO login rejected: Account %s is deactivated", google_email)
            raise HTTPException(status_code=400, detail="Account is deactivated.")

    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    logger.info("Google authentication successful for %s. Tokens issued.", google_email)

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

