from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from database import Base
import enum

class ActivityType(str, enum.Enum):
    MANUFACTURING = "manufacturing"
    TRADING = "trading"
    SERVICE = "service"

class Supplier(Base):
    __tablename__ = "suppliers"

    supplier_id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    company_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    state = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    activity_type = Column(String, nullable=True) # Using String for simplicity or Enum if strict
    rating = Column(Float, default=0.0)

class Customer(Base):
    __tablename__ = "customers"

    customer_id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False) # Can be company or person
    contact_info = Column(String, nullable=True)
    address = Column(Text, nullable=True)

class Item(Base):
    __tablename__ = "items"

    item_id = Column(Integer, primary_key=True, index=True)
    item_code = Column(String, unique=True, index=True, nullable=False)
    item_name = Column(String, nullable=False)
    category = Column(String, nullable=True)
    unit = Column(String, nullable=False) # e.g., kg, pcs, m

class Product(Base):
    __tablename__ = "products"

    product_id = Column(Integer, primary_key=True, index=True)
    product_code = Column(String, unique=True, index=True, nullable=False)
    product_name = Column(String, nullable=False)
    product_type = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    price = Column(Float, default=0.0)
    stock_quantity = Column(Integer, default=0)
