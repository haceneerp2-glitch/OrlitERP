from pydantic import BaseModel
from typing import Optional, List
from datetime import date

# BoM Schemas
class BillOfMaterialsBase(BaseModel):
    product_id: int
    item_id: int
    qty_required: float

class BillOfMaterialsCreate(BillOfMaterialsBase):
    pass

class BillOfMaterials(BillOfMaterialsBase):
    bom_id: int

    class Config:
        orm_mode = True

# Manufacturing Order Schemas
class ManufacturingOrderBase(BaseModel):
    production_order_number: str
    product_id: int
    quantity_required: float
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = "pending"

class ManufacturingOrderCreate(ManufacturingOrderBase):
    pass

class ManufacturingOrder(ManufacturingOrderBase):
    mo_id: int

    class Config:
        orm_mode = True

# Material Consumption Schemas
class MaterialConsumptionBase(BaseModel):
    mo_id: int
    item_id: int
    actual_quantity: float
    waste: Optional[float] = 0.0
    withdrawal_date: Optional[date] = None

class MaterialConsumptionCreate(MaterialConsumptionBase):
    pass

class MaterialConsumption(MaterialConsumptionBase):
    cons_id: int

    class Config:
        orm_mode = True
