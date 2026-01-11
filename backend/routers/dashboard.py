from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from database import get_db
from models import master_data, orders, inventory, hr, production, accounting

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)

@router.get("/stats")
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    # Counts
    suppliers_count = await db.scalar(select(func.count(master_data.Supplier.supplier_id)))
    customers_count = await db.scalar(select(func.count(master_data.Customer.customer_id)))
    items_count = await db.scalar(select(func.count(master_data.Item.item_id)))
    employees_count = await db.scalar(select(func.count(hr.Employee.employee_id)))
    
    # Financials
    total_sales = await db.scalar(select(func.sum(orders.Order.total_amount)).where(orders.Order.order_type == "sales")) or 0
    total_purchases = await db.scalar(select(func.sum(orders.Order.total_amount)).where(orders.Order.order_type == "purchase")) or 0
    pending_invoices = await db.scalar(select(func.count(accounting.Invoice.invoice_id)).where(accounting.Invoice.status == "unpaid"))
    
    # Inventory
    low_stock_items = await db.scalar(select(func.count(inventory.InventoryLevel.inventory_id)).where(inventory.InventoryLevel.available <= inventory.InventoryLevel.reorder_point))
    
    # Production
    active_mos = await db.scalar(select(func.count(production.ManufacturingOrder.mo_id)).where(production.ManufacturingOrder.status == "in_progress"))

    return {
        "counts": {
            "suppliers": suppliers_count,
            "customers": customers_count,
            "items": items_count,
            "employees": employees_count,
        },
        "financials": {
            "total_sales": total_sales,
            "total_purchases": total_purchases,
            "pending_invoices": pending_invoices,
        },
        "inventory": {
            "low_stock_items": low_stock_items,
        },
        "production": {
            "active_mos": active_mos,
        }
    }
