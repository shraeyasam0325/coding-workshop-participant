"""Centralized activity logging helpers for admin-only audit trails."""

from __future__ import annotations

from typing import Any

from psycopg.types.json import Jsonb

from .db import execute


def log_activity(
    conn,
    actor_id: int,
    action: str,
    *,
    project_id: int | None = None,
    milestone_id: int | None = None,
    entity_type: str | None = None,
    entity_id: int | None = None,
    **details: Any,
) -> None:
    """Persist a structured audit event for admin review."""
    payload = {key: value for key, value in details.items() if value is not None}
    execute(
        conn,
        """
        INSERT INTO activity_logs (actor_id, action, project_id, milestone_id, entity_type, entity_id, details)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """,
        (actor_id, action, project_id, milestone_id, entity_type, entity_id, Jsonb(payload)),
    )
