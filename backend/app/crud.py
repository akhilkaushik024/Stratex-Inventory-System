from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app import models, schemas
from fastapi import HTTPException, status
from typing import List, Optional

# --- PRODUCT CRUD ---

def get_product(db: Session, product_id: int) -> Optional[models.Product]:
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def get_product_by_sku(db: Session, sku: str) -> Optional[models.Product]:
    return db.query(models.Product).filter(models.Product.sku == sku).first()

def get_products(db: Session, skip: int = 0, limit: int = 100) -> List[models.Product]:
    return db.query(models.Product).order_by(models.Product.id.asc()).offset(skip).limit(limit).all()

def create_product(db: Session, product: schemas.ProductCreate) -> models.Product:
    # Check unique SKU
    db_product = get_product_by_sku(db, product.sku)
    if db_product:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product with SKU '{product.sku}' already exists."
        )
    
    db_product = models.Product(
        name=product.name,
        sku=product.sku,
        price=product.price,
        quantity_in_stock=product.quantity_in_stock
    )
    db.add(db_product)
    try:
        db.commit()
        db.refresh(db_product)
        return db_product
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Database integrity violation while creating product."
        )

def update_product(db: Session, product_id: int, product_update: schemas.ProductUpdate) -> models.Product:
    db_product = get_product(db, product_id)
    if not db_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found."
        )
    
    update_data = product_update.model_dump(exclude_unset=True)
    
    # If SKU is changing, check uniqueness
    if "sku" in update_data and update_data["sku"] != db_product.sku:
        existing_sku = get_product_by_sku(db, update_data["sku"])
        if existing_sku:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product with SKU '{update_data['sku']}' already exists."
            )
            
    for key, value in update_data.items():
        setattr(db_product, key, value)
        
    try:
        db.commit()
        db.refresh(db_product)
        return db_product
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Database integrity violation while updating product."
        )

def delete_product(db: Session, product_id: int) -> models.Product:
    db_product = get_product(db, product_id)
    if not db_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found."
        )
    
    # Check if product is in any orders
    # Due to RESTRICT foreign key constraint, sqlalchemy will fail on commit, but we can catch it gracefully.
    try:
        db.delete(db_product)
        db.commit()
        return db_product
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete product as it is referenced in existing orders."
        )


# --- CUSTOMER CRUD ---

def get_customer(db: Session, customer_id: int) -> Optional[models.Customer]:
    return db.query(models.Customer).filter(models.Customer.id == customer_id).first()

def get_customer_by_email(db: Session, email: str) -> Optional[models.Customer]:
    return db.query(models.Customer).filter(models.Customer.email == email).first()

def get_customers(db: Session, skip: int = 0, limit: int = 100) -> List[models.Customer]:
    return db.query(models.Customer).order_by(models.Customer.id.asc()).offset(skip).limit(limit).all()

def create_customer(db: Session, customer: schemas.CustomerCreate) -> models.Customer:
    db_customer = get_customer_by_email(db, customer.email)
    if db_customer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Customer with email '{customer.email}' already exists."
        )
        
    db_customer = models.Customer(
        full_name=customer.full_name,
        email=customer.email,
        phone_number=customer.phone_number
    )
    db.add(db_customer)
    try:
        db.commit()
        db.refresh(db_customer)
        return db_customer
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Database integrity violation while creating customer."
        )

def delete_customer(db: Session, customer_id: int) -> models.Customer:
    db_customer = get_customer(db, customer_id)
    if not db_customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {customer_id} not found."
        )
    
    # Deleting a customer will delete their orders due to CASCADE on foreign key
    db.delete(db_customer)
    try:
        db.commit()
        return db_customer
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to delete customer: {str(e)}"
        )


# --- ORDER CRUD ---

def get_order(db: Session, order_id: int) -> Optional[models.Order]:
    return db.query(models.Order).filter(models.Order.id == order_id).first()

def get_orders(db: Session, skip: int = 0, limit: int = 100) -> List[models.Order]:
    return db.query(models.Order).order_by(models.Order.created_at.desc()).offset(skip).limit(limit).all()

def create_order(db: Session, order_data: schemas.OrderCreate) -> models.Order:
    # 1. Verify customer exists
    customer = get_customer(db, order_data.customer_id)
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {order_data.customer_id} not found."
        )
    
    # 2. Start building Order object
    db_order = models.Order(
        customer_id=order_data.customer_id,
        total_amount=0.0
    )
    db.add(db_order)
    
    # Flush to generate order ID for foreign keys, but don't commit yet
    db.flush()
    
    running_total = 0.0
    order_items_to_create = []
    
    # To prevent duplicate product entries in the same request from passing check individually but failing collectively,
    # let's aggregate requested quantities per product first.
    aggregated_items = {}
    for item in order_data.items:
        aggregated_items[item.product_id] = aggregated_items.get(item.product_id, 0) + item.quantity

    # 3. Process items and verify stock
    for product_id, quantity in aggregated_items.items():
        product = get_product(db, product_id)
        if not product:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {product_id} not found."
            )
        
        # Check stock sufficiency
        if product.quantity_in_stock < quantity:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for product '{product.name}'. Requested: {quantity}, Available: {product.quantity_in_stock}."
            )
            
        # Deduct stock
        product.quantity_in_stock -= quantity
        
        # Calculate pricing
        item_total = product.price * quantity
        running_total += item_total
        
        # Create order item
        db_item = models.OrderItem(
            order_id=db_order.id,
            product_id=product.id,
            quantity=quantity,
            unit_price=product.price
        )
        order_items_to_create.append(db_item)
        db.add(db_item)
        
    # 4. Finalize order totals and commit
    db_order.total_amount = running_total
    
    try:
        db.commit()
        db.refresh(db_order)
        return db_order
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to place order: {str(e)}"
        )

def delete_order(db: Session, order_id: int) -> models.Order:
    db_order = get_order(db, order_id)
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID {order_id} not found."
        )
    
    # Restore stock for each item in the order before deleting the order
    for item in db_order.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if product:
            product.quantity_in_stock += item.quantity
            
    try:
        db.delete(db_order)
        db.commit()
        return db_order
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to delete order: {str(e)}"
        )


# --- DASHBOARD / STATS ---

def get_dashboard_stats(db: Session, low_stock_threshold: int = 10) -> schemas.DashboardStats:
    total_products = db.query(models.Product).count()
    total_customers = db.query(models.Customer).count()
    total_orders = db.query(models.Order).count()
    
    low_stock = db.query(models.Product).filter(models.Product.quantity_in_stock < low_stock_threshold).all()
    
    return schemas.DashboardStats(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        low_stock_products=low_stock
    )
