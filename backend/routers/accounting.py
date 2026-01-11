from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from database import get_db
from models import accounting as models
from schemas import accounting as schemas

router = APIRouter(
    prefix="/accounting",
    tags=["Accounting & Finance"],
)

# --- Invoices ---
@router.post("/invoices/", response_model=schemas.Invoice)
async def create_invoice(invoice: schemas.InvoiceCreate, db: AsyncSession = Depends(get_db)):
    db_invoice = models.Invoice(**invoice.dict())
    db.add(db_invoice)
    await db.commit()
    await db.refresh(db_invoice)
    return db_invoice

@router.get("/invoices/", response_model=List[schemas.Invoice])
async def read_invoices(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Invoice).offset(skip).limit(limit))
    return result.scalars().all()

@router.delete("/invoices/{invoice_id}")
async def delete_invoice(invoice_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Invoice).filter(models.Invoice.invoice_id == invoice_id))
    db_invoice = result.scalars().first()
    if not db_invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    await db.delete(db_invoice)
    await db.commit()
    return {"message": "Invoice deleted successfully"}

# --- Payments ---
@router.post("/payments/", response_model=schemas.Payment)
async def create_payment(payment: schemas.PaymentCreate, db: AsyncSession = Depends(get_db)):
    db_payment = models.Payment(**payment.dict())
    db.add(db_payment)
    
    # Update Invoice Status
    result = await db.execute(select(models.Invoice).filter(models.Invoice.invoice_id == payment.invoice_id))
    invoice = result.scalars().first()
    if invoice:
        # Simple logic: if payment amount >= invoice amount, mark as paid
        # Ideally we sum up all payments
        if payment.amount >= invoice.amount:
            invoice.status = "paid"
        else:
            invoice.status = "partial"
            
    await db.commit()
    await db.refresh(db_payment)
    return db_payment

@router.get("/payments/", response_model=List[schemas.Payment])
async def read_payments(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Payment).offset(skip).limit(limit))
    return result.scalars().all()
