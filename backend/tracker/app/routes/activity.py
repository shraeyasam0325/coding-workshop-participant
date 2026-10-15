"""Admin-only activity log endpoint."""

from ..db import fetch_all
from ..permissions import require_roles
from ..router import Context, router


@router.add("GET", "/activity")
@router.add("GET", "/activity-log")
def list_activity(ctx: Context) -> tuple[int, list[dict]]:
    """Return the audit trail in reverse chronological order for admins only."""
    require_roles(ctx.user, "admin")
    rows = fetch_all(
        ctx.conn,
        """
        SELECT al.id, al.action, al.project_id, p.name AS project_name,
               al.milestone_id, ms.name AS milestone_name,
               al.entity_type, al.entity_id, al.details, al.created_at,
               u.name AS actor_name, u.username AS actor_username, u.role AS actor_role
        FROM activity_logs al
        JOIN users u ON u.id = al.actor_id
        LEFT JOIN projects p ON p.id = al.project_id
        LEFT JOIN milestones ms ON ms.id = al.milestone_id
        ORDER BY al.created_at DESC LIMIT 500
        """,
    )
    return 200, rows
