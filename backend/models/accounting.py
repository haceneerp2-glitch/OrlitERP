from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Invoice(Base):
    __tablename__ = "invoices"

    invoice_id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, unique=True, index=True, nullable=False)
    order_id = Column(Integer, ForeignKey("orders.order_id"), nullable=True)
    issue_date = Column(Date, default=datetime.utcnow().date)
    amount = Column(Float, nullable=False)
    taxes = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    payment_method = Column(String, nullable=True)
    status = Column(String, default="unpaid") # paid, unpaid, partial

    order = relationship("Order")

class Payment(Base):
    __tablename__ = "payments"

    payment_id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.invoice_id"))
    amount = Column(Float, nullable=False)
    payment_date = Column(Date, default=datetime.utcnow().date)
    method = Column(String, nullable=True)

    invoice = relationship("Invoice")

class AccountsReceivable(Base):
    __tablename__ = "accounts_receivable"

    receivable_id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.customer_id"))
    invoice_id = Column(Integer, ForeignKey("invoices.invoice_id"))
    due_date = Column(Date, nullable=True)
    total_amount = Column(Float, nullable=False)
    paid_amount = Column(Float, default=0.0)
    status = Column(String, default="due") # overdue, due, paid

    customer = relationship("Customer")
    invoice = relationship("Invoice")
