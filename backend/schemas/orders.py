from pydantic import BaseModel
from typing import Optional, List
from datetime import date

# Order Item Schemas
class OrderItemBase(BaseModel):
    item_id: int
    quantity: float
    unit_price: float
    discount: Optional[float] = 0.0

class OrderItemCreate(OrderItemBase):
    pass

class OrderItem(OrderItemBase):
    order_item_id: int
    line_total: float

    class Config:
        orm_mode = True

# Order Schemas
class OrderBase(BaseModel):
    order_number: str
    order_type: str
    order_date: Optional[date] = None
    supplier_id: Optional[int] = None
    customer_id: Optional[int] = None
    status: Optional[str] = "pending"

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class Order(OrderBase):
    order_id: int
    total_amount: float
    items: List[OrderItem] = []

    class Config:
        orm_mode = True

# Receiving Note Schemas
class ReceivingNoteBase(BaseModel):
    purchase_order_id: int
    note_number: str
    quantity_received: float
    quality_status: Optional[str] = "compliant"
    date_received: Optional[date] = None

class ReceivingNoteCreate(ReceivingNoteBase):
    pass

class ReceivingNote(ReceivingNoteBase):
    rn_id: int

    class Config:
        orm_mode = True
