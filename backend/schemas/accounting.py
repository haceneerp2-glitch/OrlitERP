from pydantic import BaseModel
from typing import Optional
from datetime import date

# Invoice Schemas
class InvoiceBase(BaseModel):
    invoice_number: str
    order_id: Optional[int] = None
    issue_date: Optional[date] = None
    amount: float
    taxes: Optional[float] = 0.0
    discount: Optional[float] = 0.0
    payment_method: Optional[str] = None
    status: Optional[str] = "unpaid"

class InvoiceCreate(InvoiceBase):
    pass

class Invoice(InvoiceBase):
    invoice_id: int

    class Config:
        orm_mode = True

# Payment Schemas
class PaymentBase(BaseModel):
    invoice_id: int
    amount: float
    payment_date: Optional[date] = None
    method: Optional[str] = None

class PaymentCreate(PaymentBase):
    pass

class Payment(PaymentBase):
    payment_id: int

    class Config:
        orm_mode = True

# Accounts Receivable Schemas
class AccountsReceivableBase(BaseModel):
    customer_id: int
    invoice_id: int
    due_date: Optional[date] = None
    total_amount: float
    paid_amount: Optional[float] = 0.0
    status: Optional[str] = "due"

class AccountsReceivableCreate(AccountsReceivableBase):
    pass

class AccountsReceivable(AccountsReceivableBase):
    receivable_id: int

    class Config:
        orm_mode = True
