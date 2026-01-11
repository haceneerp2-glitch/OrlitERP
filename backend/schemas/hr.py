from pydantic import BaseModel
from typing import Optional
import datetime

# Employee Schemas
class EmployeeBase(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    job_position: Optional[str] = None
    department: Optional[str] = None
    basic_salary: Optional[float] = 0.0
    hire_date: Optional[datetime.date] = None

class EmployeeCreate(EmployeeBase):
    pass

class Employee(EmployeeBase):
    employee_id: int

    class Config:
        orm_mode = True

# Attendance Schemas
class AttendanceBase(BaseModel):
    employee_id: int
    date: Optional[datetime.date] = None
    time_in: Optional[datetime.datetime] = None
    time_out: Optional[datetime.datetime] = None
    status: Optional[str] = "present"

class AttendanceCreate(AttendanceBase):
    pass

class Attendance(AttendanceBase):
    attendance_id: int

    class Config:
        orm_mode = True

# Leave Schemas
class LeaveRequestBase(BaseModel):
    employee_id: int
    start_date: datetime.date
    end_date: datetime.date
    reason: Optional[str] = None
    status: Optional[str] = "pending"

class LeaveRequestCreate(LeaveRequestBase):
    pass

class LeaveRequest(LeaveRequestBase):
    leave_id: int

    class Config:
        orm_mode = True
