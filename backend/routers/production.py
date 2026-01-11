from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from database import get_db
from models import production as models
from schemas import production as schemas

router = APIRouter(
    prefix="/production",
    tags=["Production Management"],
)

# --- Bill of Materials ---
@router.post("/bom/", response_model=schemas.BillOfMaterials)
async def create_bom(bom: schemas.BillOfMaterialsCreate, db: AsyncSession = Depends(get_db)):
    db_bom = models.BillOfMaterials(**bom.dict())
    db.add(db_bom)
    await db.commit()
    await db.refresh(db_bom)
    return db_bom

@router.get("/bom/", response_model=List[schemas.BillOfMaterials])
async def read_bom(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.BillOfMaterials).offset(skip).limit(limit))
    return result.scalars().all()

# --- Manufacturing Orders ---
@router.post("/orders/", response_model=schemas.ManufacturingOrder)
async def create_mo(mo: schemas.ManufacturingOrderCreate, db: AsyncSession = Depends(get_db)):
    db_mo = models.ManufacturingOrder(**mo.dict())
    db.add(db_mo)
    await db.commit()
    await db.refresh(db_mo)
    return db_mo

@router.get("/orders/", response_model=List[schemas.ManufacturingOrder])
async def read_mos(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.ManufacturingOrder).offset(skip).limit(limit))
    return result.scalars().all()

@router.put("/orders/{mo_id}", response_model=schemas.ManufacturingOrder)
async def update_mo(mo_id: int, mo: schemas.ManufacturingOrderCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.ManufacturingOrder).filter(models.ManufacturingOrder.mo_id == mo_id))
    db_mo = result.scalars().first()
    if not db_mo:
        raise HTTPException(status_code=404, detail="Manufacturing order not found")
    
    db_mo.production_order_number = mo.production_order_number
    db_mo.product_id = mo.product_id
    db_mo.quantity_required = mo.quantity_required
    db_mo.start_date = mo.start_date
    db_mo.status = mo.status
    
    await db.commit()
    await db.refresh(db_mo)
    return db_mo

@router.delete("/orders/{mo_id}")
async def delete_mo(mo_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.ManufacturingOrder).filter(models.ManufacturingOrder.mo_id == mo_id))
    db_mo = result.scalars().first()
    if not db_mo:
        raise HTTPException(status_code=404, detail="Manufacturing order not found")
    
    await db.delete(db_mo)
    await db.commit()
    return {"message": "Manufacturing order deleted successfully"}

# --- Material Consumption ---
@router.post("/consumption/", response_model=schemas.MaterialConsumption)
async def create_consumption(cons: schemas.MaterialConsumptionCreate, db: AsyncSession = Depends(get_db)):
    db_cons = models.MaterialConsumption(**cons.dict())
    db.add(db_cons)
    
    # Auto-create outbound stock movement
    # Simplified: Assuming consumption triggers stock reduction
    # In a real system, we'd call the inventory service or create a StockMovement record here
    
    await db.commit()
    await db.refresh(db_cons)
    return db_cons

@router.get("/consumption/", response_model=List[schemas.MaterialConsumption])
async def read_consumptions(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.MaterialConsumption).offset(skip).limit(limit))
    return result.scalars().all()
