# Copyright (c) 2026 SpeakCV Team
# This project is licensed under the MIT License.
# See the LICENSE file in the project root for more information.

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import sql_models
from ..database.database import get_db
from .profile import get_current_user

router = APIRouter()

@router.get("/api/my-stats")
async def get_my_stats(
    current_user: sql_models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Aggregate interview statistics for the authenticated user."""
    histories = (
        db.query(sql_models.InterviewHistory)
        .filter(sql_models.InterviewHistory.user_id == current_user.id)
        .order_by(sql_models.InterviewHistory.created_at.asc())
        .all()
    )

    if not histories:
        return {
            "total_interviews": 0,
            "avg_score": 0,
            "best_score": 0,
            "latest_score": 0,
            "score_trend": 0,
            "history": [],
            "position_stats": [],
        }

    scores = [h.score for h in histories if h.score is not None]
    total = len(histories)
    avg_score = round(sum(scores) / len(scores), 1) if scores else 0
    best_score = round(max(scores), 1) if scores else 0
    latest_score = round(scores[-1], 1) if scores else 0

    # Score trend: compare last 3 vs first 3
    if len(scores) >= 6:
        first_avg = sum(scores[:3]) / 3
        last_avg = sum(scores[-3:]) / 3
        score_trend = round(((last_avg - first_avg) / first_avg) * 100, 1) if first_avg > 0 else 0
    elif len(scores) >= 2:
        score_trend = round(((scores[-1] - scores[0]) / scores[0]) * 100, 1) if scores[0] > 0 else 0
    else:
        score_trend = 0

    # History for chart
    history_list = [
        {
            "id": h.id,
            "score": round(h.score, 1) if h.score else 0,
            "position": h.position or "Tự do",
            "title": h.title or f"Phỏng vấn {h.position}",
            "date": h.created_at.strftime("%d/%m") if h.created_at else "",
            "full_date": h.created_at.isoformat() if h.created_at else "",
            "interview_type": h.interview_type or "free",
        }
        for h in histories
    ]

    # Stats by position
    position_map = {}
    for h in histories:
        pos = h.position or "Tự do"
        if pos not in position_map:
            position_map[pos] = {"count": 0, "total_score": 0}
        position_map[pos]["count"] += 1
        if h.score:
            position_map[pos]["total_score"] += h.score

    position_stats = [
        {
            "position": pos,
            "count": data["count"],
            "avg_score": round(data["total_score"] / data["count"], 1) if data["count"] > 0 else 0,
        }
        for pos, data in sorted(position_map.items(), key=lambda x: x[1]["count"], reverse=True)
    ]

    return {
        "total_interviews": total,
        "avg_score": avg_score,
        "best_score": best_score,
        "latest_score": latest_score,
        "score_trend": score_trend,
        "history": history_list,
        "position_stats": position_stats,
    }
