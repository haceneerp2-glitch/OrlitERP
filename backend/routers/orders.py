from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List
from database import get_db
from models import orders as models
from models import inventory as inv_models
from schemas import orders as schemas

router = APIRouter(
    prefix="/orders",
    tags=["Order Management"],
)

# --- Orders ---
@router.post("/", response_model=schemas.Order)
async def create_order(order: schemas.OrderCreate, db: AsyncSession = Depends(get_db)):
    # Calculate totals
    total_amount = 0
    db_items = []
    
    for item in order.items:
        line_total = (item.quantity * item.unit_price) - item.discount
        total_amount += line_total
        db_item = models.OrderItem(**item.dict(), line_total=line_total)
        db_items.append(db_item)
    
    db_order = models.Order(
        order_number=order.order_number,
        order_type=order.order_type,
        order_date=order.order_date,
        supplier_id=order.supplier_id,
        customer_id=order.customer_id,
        status=order.status,
        total_amount=total_amount
    )
    
    db.add(db_order)
    await db.commit()
    await db.refresh(db_order)
    
    for db_item in db_items:
        db_item.order_id = db_order.order_id
        db.add(db_item)
    
    await db.commit()
    
    # Reload order with items
    result = await db.execute(
        select(models.Order)
        .options(selectinload(models.Order.items))
        .filter(models.Order.order_id == db_order.order_id)
    )
    return result.scalars().first()

@router.get("/", response_model=List[schemas.Order])
async def read_orders(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.Order)
        .options(selectinload(models.Order.items))
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

@router.put("/{order_id}", response_model=schemas.Order)
async def update_order(order_id: int, order: schemas.OrderCreate, db: AsyncSession = Depends(get_db)):
    # 1. Fetch existing order
    result = await db.execute(select(models.Order).options(selectinload(models.Order.items)).filter(models.Order.order_id == order_id))
    db_order = result.scalars().first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")

    # 2. Update basic fields
    db_order.order_number = order.order_number
    db_order.order_type = order.order_type
    db_order.order_date = order.order_date
    db_order.supplier_id = order.supplier_id
    db_order.customer_id = order.customer_id
    db_order.status = order.status

    # 3. Handle Items (Full Replacement Strategy)
    # Remove existing items
    for item in db_order.items:
        await db.delete(item)
    
    # Calculate new totals and add items
    total_amount = 0
    
    for item in order.items:
        line_total = (item.quantity * item.unit_price) - item.discount
        total_amount += line_total
        db_item = models.OrderItem(**item.dict(), line_total=line_total)
        db_item.order_id = db_order.order_id # Link to existing order
        db.add(db_item)
    
    db_order.total_amount = total_amount
    
    await db.commit()
    await db.refresh(db_order) # This might not verify the re-added items immediately without re-query, but let's try
    
    # Re-fetch to ensure clean state
    result = await db.execute(
        select(models.Order)
        .options(selectinload(models.Order.items))
        .filter(models.Order.order_id == order_id)
    )
    return result.scalars().first()

@router.delete("/{order_id}")
async def delete_order(order_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Order).options(selectinload(models.Order.items)).filter(models.Order.order_id == order_id))
    db_order = result.scalars().first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Items should cascade delete if configured in DB, but explicit delete is safer here for SQLAlchemy async
    for item in db_order.items:
        await db.delete(item)
        
    await db.delete(db_order)
    await db.commit()
    return {"message": "Order deleted successfully"}

# --- Receiving Notes ---
@router.post("/receive/", response_model=schemas.ReceivingNote)
async def create_receiving_note(note: schemas.ReceivingNoteCreate, db: AsyncSession = Depends(get_db)):
    db_note = models.ReceivingNote(**note.dict())
    db.add(db_note)
    
    # Update Order Status
    result = await db.execute(select(models.Order).filter(models.Order.order_id == note.purchase_order_id))
    order = result.scalars().first()
    if order:
        order.status = "received"
        
        # Auto-create inbound stock movement
        # Note: This is simplified. Ideally we'd loop through order items.
        # For now, assuming receiving note corresponds to order items logic would be more complex
        # Here we just update status. Full implementation would require mapping received qty to items.
    
    await db.commit()
    await db.refresh(db_note)
    return db_note
