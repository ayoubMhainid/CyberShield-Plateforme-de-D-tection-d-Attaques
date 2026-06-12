from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from datetime import timedelta
from services.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from database.mongoDB import users_collection

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    username: str
    email: str
    role: str

class ChangePasswordRequest(BaseModel):
    username: str
    new_password: str

class DeleteAccountRequest(BaseModel):
    username: str
    

@router.post("/register")
def register(req: RegisterRequest):
    """Register a new user."""
    # Check if username exists
    if users_collection.find_one({"username": req.username}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists",
        )

    # Check if email exists
    if users_collection.find_one({"email": req.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Hash password
    hashed_pw = get_password_hash(req.password)

    # Create user
    user = {
        "username": req.username,
        "email": req.email,
        "password": hashed_pw,
        "role": "user",
        "created_at": __import__("datetime").datetime.utcnow(),
    }

    result = users_collection.insert_one(user)
    user_id = str(result.inserted_id)

    # Generate token
    access_token = create_access_token(
        data={"sub": user_id},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": req.username,
        "role": "user",
    }


@router.post("/login")
def login(req: LoginRequest):
    """Login and get access token."""
    user = users_collection.find_one({"username": req.username})

    if not user or not verify_password(req.password, user.get("password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    user_id = str(user["_id"])

    # Generate token
    access_token = create_access_token(
        data={"sub": user_id},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user["username"],
        "role": user.get("role", "user"),
    }


@router.get("/me")
def get_current_user(user_id: str):
    """Get current user info."""
    from bson import ObjectId

    user = users_collection.find_one({"_id": ObjectId(user_id)})

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return {
        "user_id": str(user["_id"]),
        "username": user["username"],
        "email": user["email"],
        "role": user.get("role", "user"),
    }




@router.put("/change-password")
def change_password(req: ChangePasswordRequest):
    user = users_collection.find_one({"username": req.username})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    hashed_password = get_password_hash(req.new_password)

    users_collection.update_one(
        {"username": req.username},
        {"$set": {"password": hashed_password}}
    )

    return {"message": "Password changed successfully"}



@router.delete("/delete-account")
def delete_account(req: DeleteAccountRequest):
    result = users_collection.delete_one({"username": req.username})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "Account deleted successfully"}