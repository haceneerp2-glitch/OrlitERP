from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date, Text
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class BillOfMaterials(Base):
    __tablename__ = "bill_of_materials"

    bom_id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.product_id"))
    item_id = Column(Integer, ForeignKey("items.item_id"))
    qty_required = Column(Float, nullable=False)

    product = relationship("Product")
    item = relationship("Item")

class ManufacturingOrder(Base):
    __tablename__ = "manufacturing_orders"

    mo_id = Column(Integer, primary_key=True, index=True)
    production_order_number = Column(String, unique=True, index=True, nullable=False)
    product_id = Column(Integer, ForeignKey("products.product_id"))
    quantity_required = Column(Float, nullable=False)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    status = Column(String, default="pending") # pending, in_progress, completed, cancelled

    product = relationship("Product")

class MaterialConsumption(Base):
    __tablename__ = "material_consumption"

    cons_id = Column(Integer, primary_key=True, index=True)
    mo_id = Column(Integer, ForeignKey("manufacturing_orders.mo_id"))
    item_id = Column(Integer, ForeignKey("items.item_id"))
    actual_quantity = Column(Float, nullable=False)
    waste = Column(Float, default=0.0)
    withdrawal_date = Column(Date, default=datetime.utcnow().date)

    manufacturing_order = relationship("ManufacturingOrder")
    item = relationship("Item")
