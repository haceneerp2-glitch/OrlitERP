from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from database import get_db
from models import inventory as models
from schemas import inventory as schemas

router = APIRouter(
    prefix="/inventory",
    tags=["Inventory Management"],
)

# --- Inventory Levels ---
@router.post("/levels/", response_model=schemas.InventoryLevel)
async def create_inventory_level(level: schemas.InventoryLevelCreate, db: AsyncSession = Depends(get_db)):
    db_level = models.InventoryLevel(**level.dict())
    db.add(db_level)
    await db.commit()
    await db.refresh(db_level)
    return db_level

@router.get("/levels/", response_model=List[schemas.InventoryLevel])
async def read_inventory_levels(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.InventoryLevel).offset(skip).limit(limit))
    return result.scalars().all()

@router.put("/levels/{inventory_id}", response_model=schemas.InventoryLevel)
async def update_inventory_level(inventory_id: int, level: schemas.InventoryLevelCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.InventoryLevel).filter(models.InventoryLevel.inventory_id == inventory_id))
    db_level = result.scalars().first()
    if not db_level:
        raise HTTPException(status_code=404, detail="Inventory level not found")
    
    for key, value in level.dict().items():
        setattr(db_level, key, value)
    
    await db.commit()
    await db.refresh(db_level)
    return db_level

@router.delete("/levels/{inventory_id}")
async def delete_inventory_level(inventory_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.InventoryLevel).filter(models.InventoryLevel.inventory_id == inventory_id))
    db_level = result.scalars().first()
    if not db_level:
        raise HTTPException(status_code=404, detail="Inventory level not found")
    
    await db.delete(db_level)
    await db.commit()
    return {"message": "Inventory level deleted"}

# --- Stock Movements ---
@router.post("/movements/", response_model=schemas.StockMovement)
async def create_stock_movement(movement: schemas.StockMovementCreate, db: AsyncSession = Depends(get_db)):
    # 1. Create Movement
    db_movement = models.StockMovement(**movement.dict())
    db.add(db_movement)
    
    # 2. Update Inventory Level
    result = await db.execute(select(models.InventoryLevel).filter(models.InventoryLevel.item_id == movement.item_id))
    inventory_level = result.scalars().first()
    
    if not inventory_level:
        # Create if not exists
        inventory_level = models.InventoryLevel(item_id=movement.item_id, on_hand=0, available=0)
        db.add(inventory_level)
    
    if movement.movement_type == "inbound":
        inventory_level.on_hand += movement.quantity
        inventory_level.available += movement.quantity
    elif movement.movement_type == "outbound":
        inventory_level.on_hand -= movement.quantity
        inventory_level.available -= movement.quantity
        
    await db.commit()
    await db.refresh(db_movement)
    return db_movement

@router.get("/movements/", response_model=List[schemas.StockMovement])
async def read_stock_movements(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.StockMovement).offset(skip).limit(limit))
    return result.scalars().all()

@router.delete("/movements/{movement_id}")
async def delete_stock_movement(movement_id: int, db: AsyncSession = Depends(get_db)):
    # 1. Find Movement
    result = await db.execute(select(models.StockMovement).filter(models.StockMovement.movement_id == movement_id))
    db_movement = result.scalars().first()
    if not db_movement:
        raise HTTPException(status_code=404, detail="Stock movement not found")

    # 2. Find Inventory Level
    result_level = await db.execute(select(models.InventoryLevel).filter(models.InventoryLevel.item_id == db_movement.item_id))
    inventory_level = result_level.scalars().first()

    if inventory_level:
        # 3. Reverse the effect on Inventory Level
        if db_movement.movement_type == "inbound":
            inventory_level.on_hand -= db_movement.quantity
            inventory_level.available -= db_movement.quantity
        elif db_movement.movement_type == "outbound":
            inventory_level.on_hand += db_movement.quantity
            inventory_level.available += db_movement.quantity

    # 4. Delete the movement
    await db.delete(db_movement)
    await db.commit()
    
    return {"message": "Stock movement deleted and inventory corrected"}
