from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# InventoryLevel Schemas
class InventoryLevelBase(BaseModel):
    item_id: int
    on_hand: Optional[float] = 0.0
    available: Optional[float] = 0.0
    min_level: Optional[float] = 0.0
    max_level: Optional[float] = 0.0
    reorder_point: Optional[float] = 0.0

class InventoryLevelCreate(InventoryLevelBase):
    pass

class InventoryLevel(InventoryLevelBase):
    inventory_id: int

    class Config:
        orm_mode = True

# StockMovement Schemas
class StockMovementBase(BaseModel):
    item_id: int
    movement_type: str
    transaction_number: Optional[str] = None
    date: Optional[datetime] = None
    reference_id: Optional[int] = None
    quantity: float
    condition: Optional[str] = "good"
    beneficiary: Optional[str] = None
    employee_id: Optional[int] = None
    delivery_status: Optional[str] = "completed"

class StockMovementCreate(StockMovementBase):
    pass

class StockMovement(StockMovementBase):
    movement_id: int

    class Config:
        orm_mode = True
