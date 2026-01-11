from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum, Date
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
import enum

class OrderType(str, enum.Enum):
    PURCHASE = "purchase"
    SALES = "sales"

class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    RECEIVED = "received"
    CANCELLED = "cancelled"
    DELIVERED = "delivered"

class Order(Base):
    __tablename__ = "orders"

    order_id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String, unique=True, index=True, nullable=False)
    order_type = Column(String, nullable=False) # purchase, sales
    order_date = Column(Date, default=datetime.utcnow().date)
    supplier_id = Column(Integer, ForeignKey("suppliers.supplier_id"), nullable=True)
    customer_id = Column(Integer, ForeignKey("customers.customer_id"), nullable=True)
    status = Column(String, default="pending")
    total_amount = Column(Float, default=0.0)

    supplier = relationship("Supplier")
    customer = relationship("Customer")
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"

    order_item_id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.order_id"))
    item_id = Column(Integer, ForeignKey("items.item_id"))
    quantity = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=False)
    discount = Column(Float, default=0.0)
    line_total = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    item = relationship("Item")

class ReceivingNote(Base):
    __tablename__ = "receiving_notes"

    rn_id = Column(Integer, primary_key=True, index=True)
    purchase_order_id = Column(Integer, ForeignKey("orders.order_id"))
    note_number = Column(String, unique=True, index=True)
    quantity_received = Column(Float, nullable=False)
    quality_status = Column(String, default="compliant") # compliant, rejected
    date_received = Column(Date, default=datetime.utcnow().date)

    purchase_order = relationship("Order")
