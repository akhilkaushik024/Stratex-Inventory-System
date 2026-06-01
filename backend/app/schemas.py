from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime

# --- PRODUCT SCHEMAS ---
class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, description="Product Name")
    sku: str = Field(..., min_length=1, description="Product Unique SKU Code")
    price: float = Field(..., ge=0.0, description="Product Price")
    quantity_in_stock: int = Field(..., ge=0, description="Quantity available in stock")

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    sku: Optional[str] = Field(None, min_length=1)
    price: Optional[float] = Field(None, ge=0.0)
    quantity_in_stock: Optional[int] = Field(None, ge=0)

class ProductResponse(ProductBase):
    id: int

    class Config:
        from_attributes = True


# --- CUSTOMER SCHEMAS ---
class CustomerBase(BaseModel):
    full_name: str = Field(..., min_length=1, description="Customer's Full Name")
    email: EmailStr = Field(..., description="Customer's unique Email Address")
    phone_number: str = Field(..., min_length=5, description="Customer's Phone Number")

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: int

    class Config:
        from_attributes = True


# --- ORDER ITEM SCHEMAS ---
class OrderItemCreate(BaseModel):
    product_id: int = Field(..., gt=0, description="ID of the product")
    quantity: int = Field(..., gt=0, description="Quantity ordered")

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    product: ProductResponse

    class Config:
        from_attributes = True


# --- ORDER SCHEMAS ---
class OrderCreate(BaseModel):
    customer_id: int = Field(..., gt=0, description="ID of the customer placing the order")
    items: List[OrderItemCreate] = Field(..., min_length=1, description="List of products and their quantities in the order")

class OrderResponse(BaseModel):
    id: int
    customer_id: int
    total_amount: float
    created_at: datetime
    customer: CustomerResponse
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True


# --- DASHBOARD SCHEMAS ---
class DashboardStats(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_products: List[ProductResponse]
