from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
import enum

class MovementType(str, enum.Enum):
    INBOUND = "inbound"
    OUTBOUND = "outbound"

class InventoryLevel(Base):
    __tablename__ = "inventory_levels"

    inventory_id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.item_id"), unique=True)
    on_hand = Column(Float, default=0.0)
    available = Column(Float, default=0.0)
    min_level = Column(Float, default=0.0)
    max_level = Column(Float, default=0.0)
    reorder_point = Column(Float, default=0.0)

    item = relationship("Item")

class StockMovement(Base):
    __tablename__ = "stock_movements"

    movement_id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.item_id"))
    movement_type = Column(String, nullable=False) # inbound, outbound
    transaction_number = Column(String, nullable=True)
    date = Column(DateTime, default=datetime.utcnow)
    reference_id = Column(Integer, nullable=True) # PO, SO, MO ID
    quantity = Column(Float, nullable=False)
    condition = Column(String, default="good") # good, damaged, missing
    beneficiary = Column(String, nullable=True) # customer, supplier, department
    employee_id = Column(Integer, ForeignKey("employees.employee_id"), nullable=True)
    delivery_status = Column(String, default="completed")

    item = relationship("Item")
    employee = relationship("Employee")
