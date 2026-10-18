import os
import time
from typing import Literal
from uuid import UUID

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from supabase import create_client

load_dotenv()

Status = Literal["todo", "doing", "done"]
supabase = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SECRET_KEY"])

app = FastAPI(title="Kanban API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


class CardCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    status: Status = "todo"


class CardUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    status: Status | None = None


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/cards")
def list_cards():
    return supabase.table("cards").select("*").order("position").execute().data


@app.post("/cards", status_code=201)
def create_card(body: CardCreate):
    row = {"title": body.title.strip(), "status": body.status, "position": time.time()}
    return supabase.table("cards").insert(row).execute().data[0]


@app.patch("/cards/{card_id}")
def update_card(card_id: UUID, body: CardUpdate):
    changes = body.model_dump(exclude_none=True)
    if not changes:
        raise HTTPException(400, "Nothing to update")
    if "status" in changes:
        changes["position"] = time.time()  # moved card goes to the bottom of its new column
    res = supabase.table("cards").update(changes).eq("id", str(card_id)).execute()
    if not res.data:
        raise HTTPException(404, "Card not found")
    return res.data[0]


@app.delete("/cards/{card_id}", status_code=204)
def delete_card(card_id: UUID):
    res = supabase.table("cards").delete().eq("id", str(card_id)).execute()
    if not res.data:
        raise HTTPException(404, "Card not found")