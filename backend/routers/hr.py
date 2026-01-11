from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from database import get_db
from models import hr as models
from schemas import hr as schemas

router = APIRouter(
    prefix="/hr",
    tags=["HR Management"],
)

# --- Employees ---
@router.post("/employees/", response_model=schemas.Employee)
async def create_employee(employee: schemas.EmployeeCreate, db: AsyncSession = Depends(get_db)):
    db_employee = models.Employee(**employee.dict())
    db.add(db_employee)
    await db.commit()
    await db.refresh(db_employee)
    return db_employee

@router.get("/employees/", response_model=List[schemas.Employee])
async def read_employees(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Employee).offset(skip).limit(limit))
    return result.scalars().all()

@router.put("/employees/{employee_id}", response_model=schemas.Employee)
async def update_employee(employee_id: int, employee: schemas.EmployeeCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Employee).filter(models.Employee.employee_id == employee_id))
    db_employee = result.scalars().first()
    if db_employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    for key, value in employee.dict().items():
        setattr(db_employee, key, value)
    
    await db.commit()
    await db.refresh(db_employee)
    return db_employee

@router.delete("/employees/{employee_id}")
async def delete_employee(employee_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Employee).filter(models.Employee.employee_id == employee_id))
    db_employee = result.scalars().first()
    if db_employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    await db.delete(db_employee)
    await db.commit()
    return {"message": "Employee deleted successfully"}

# --- Attendance ---
@router.post("/attendance/", response_model=schemas.Attendance)
async def create_attendance(attendance: schemas.AttendanceCreate, db: AsyncSession = Depends(get_db)):
    db_attendance = models.Attendance(**attendance.dict())
    db.add(db_attendance)
    await db.commit()
    await db.refresh(db_attendance)
    return db_attendance

@router.get("/attendance/", response_model=List[schemas.Attendance])
async def read_attendance(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Attendance).offset(skip).limit(limit))
    return result.scalars().all()

@router.put("/attendance/{attendance_id}", response_model=schemas.Attendance)
async def update_attendance(attendance_id: int, attendance: schemas.AttendanceCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Attendance).filter(models.Attendance.attendance_id == attendance_id))
    db_attendance = result.scalars().first()
    if db_attendance is None:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    
    for key, value in attendance.dict().items():
        setattr(db_attendance, key, value)
    
    await db.commit()
    await db.refresh(db_attendance)
    return db_attendance

@router.delete("/attendance/{attendance_id}")
async def delete_attendance(attendance_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Attendance).filter(models.Attendance.attendance_id == attendance_id))
    db_attendance = result.scalars().first()
    if db_attendance is None:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    
    await db.delete(db_attendance)
    await db.commit()
    return {"message": "Attendance record deleted successfully"}

# --- Leave Requests ---
@router.post("/leaves/", response_model=schemas.LeaveRequest)
async def create_leave_request(leave: schemas.LeaveRequestCreate, db: AsyncSession = Depends(get_db)):
    db_leave = models.LeaveRequest(**leave.dict())
    db.add(db_leave)
    await db.commit()
    await db.refresh(db_leave)
    return db_leave

@router.get("/leaves/", response_model=List[schemas.LeaveRequest])
async def read_leave_requests(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.LeaveRequest).offset(skip).limit(limit))
    return result.scalars().all()

@router.put("/leaves/{leave_id}", response_model=schemas.LeaveRequest)
async def update_leave_request(leave_id: int, leave: schemas.LeaveRequestCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.LeaveRequest).filter(models.LeaveRequest.leave_id == leave_id))
    db_leave = result.scalars().first()
    if db_leave is None:
        raise HTTPException(status_code=404, detail="Leave request not found")
    
    for key, value in leave.dict().items():
        setattr(db_leave, key, value)
    
    await db.commit()
    await db.refresh(db_leave)
    return db_leave

@router.delete("/leaves/{leave_id}")
async def delete_leave_request(leave_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.LeaveRequest).filter(models.LeaveRequest.leave_id == leave_id))
    db_leave = result.scalars().first()
    if db_leave is None:
        raise HTTPException(status_code=404, detail="Leave request not found")
    
    await db.delete(db_leave)
    await db.commit()
    return {"message": "Leave request deleted successfully"}
