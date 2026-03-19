from datetime import datetime
from typing import Optional, List # Added List for clarity

from sqlalchemy import Enum, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum
from .database import Base

class UserRole(enum.Enum):
    ADMIN = "admin"
    MEMBER = "member"

class TaskStatus(enum.Enum):
    TODO = "todo"
    PROGRESS = "in_progress"
    DONE = "done"

class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), 
        onupdate=func.now()
    )

class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True)
    email: Mapped[str] = mapped_column(String(255), unique=True)
    name: Mapped[str] = mapped_column(String(255))
    password: Mapped[str] = mapped_column()

    teams: Mapped[List["Team"]] = relationship(
        secondary="user_teams",
        back_populates="members",
        lazy="selectin"
    )

    tasks: Mapped[List["Task"]] = relationship(
        back_populates="assigned_user",
        lazy="selectin"
    )

class Team(Base, TimestampMixin):
    __tablename__ = "teams"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    
    members: Mapped[List["User"]] = relationship(
        secondary="user_teams",
        back_populates="teams",
        lazy="selectin"
    )

    projects: Mapped[List["Project"]] = relationship(
        back_populates="team", 
        lazy="selectin"
    )

class UserTeams(Base, TimestampMixin):
    __tablename__ = "user_teams"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    team_id: Mapped[int] = mapped_column(ForeignKey("teams.id"))
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role_type"),
        default=UserRole.MEMBER
    )

    __table_args__ = (
        UniqueConstraint("user_id", "team_id", name="uq_user_team"),
    )

class Project(Base, TimestampMixin):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    team_id: Mapped[int] = mapped_column(ForeignKey("teams.id"))
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"))

    team: Mapped["Team"] = relationship(back_populates="projects")
    
    tasks: Mapped[List["Task"]] = relationship(back_populates="project", lazy="selectin")

class Task(Base, TimestampMixin):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(String)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"))
    assigned_user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))
    status: Mapped[TaskStatus] = mapped_column(
        Enum(TaskStatus, name="task_status_type"),
        default=TaskStatus.TODO
    )
    deadline: Mapped[Optional[datetime]] = mapped_column()
    
    assigned_user: Mapped["User"] = relationship(
        back_populates="tasks"
    )
    
    project: Mapped["Project"] = relationship(back_populates="tasks")
    
class Comment(Base, TimestampMixin):
    __tablename__ = "comments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    task_id: Mapped[int] = mapped_column(ForeignKey("tasks.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    content: Mapped[str] = mapped_column(String)