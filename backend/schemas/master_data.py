from pydantic import BaseModel
from typing import Optional

# Supplier Schemas
class SupplierBase(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    state: Optional[str] = None
    address: Optional[str] = None
    activity_type: Optional[str] = None
    rating: Optional[float] = 0.0

class SupplierCreate(SupplierBase):
    pass

class Supplier(SupplierBase):
    supplier_id: int

    class Config:
        orm_mode = True

# Customer Schemas
class CustomerBase(BaseModel):
    full_name: str
    contact_info: Optional[str] = None
    address: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    customer_id: int

    class Config:
        orm_mode = True

# Item Schemas
class ItemBase(BaseModel):
    item_code: str
    item_name: str
    category: Optional[str] = None
    unit: str

class ItemCreate(ItemBase):
    pass

class Item(ItemBase):
    item_id: int

    class Config:
        orm_mode = True

# Product Schemas
class ProductBase(BaseModel):
    product_code: str
    product_name: str
    product_type: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = 0.0
    stock_quantity: Optional[int] = 0

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    product_id: int

    class Config:
        orm_mode = True
