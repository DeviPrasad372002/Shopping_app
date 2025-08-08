from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List
import os
import logging
from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
import json

# Database connection
DATABASE_URL = "postgresql://postgres:Devi3722%23@database-1.cq9ga4e6qc8q.us-east-1.rds.amazonaws.com:5432/mydb"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

app = FastAPI()
logging.basicConfig(level=logging.INFO)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change in production to your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for product images
images_dir = os.path.join(os.path.dirname(__file__), "images")
app.mount("/images", StaticFiles(directory=images_dir), name="images")
BASE_URL = "http://localhost:8000"

# ==== Pydantic Models ====
class Product(BaseModel):
    id: int
    name: str
    description: str
    price: float
    image: str

class CartItem(BaseModel):
    product_id: int
    quantity: int

class DetailedCartItem(BaseModel):
    product_id: int
    quantity: int
    name: str
    image: str

class User(BaseModel):
    username: str
    password: str

class CheckoutRequest(BaseModel):
    full_name: str
    street: str
    city: str
    state: str
    postal_code: str
    phone: str
    items: List[CartItem]

# ==== SQLAlchemy Tables ====
class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    orders = relationship("OrderDB", back_populates="user")

class OrderDB(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    full_name = Column(String)
    street = Column(String)
    city = Column(String)
    state = Column(String)
    postal_code = Column(String)
    phone = Column(String)
    items_json = Column(Text)  # store cart snapshot as JSON string
    user = relationship("UserDB", back_populates="orders")

Base.metadata.create_all(bind=engine)

# ==== DB Dependency ====
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==== In-memory products ====
products = [
    Product(id=1, name="T-Shirt", description="Cotton T-Shirt", price=499.99, image=f"{BASE_URL}/images/tshirt.png"),
    Product(id=2, name="Jeans", description="Denim Blue Jeans", price=1299.00, image=f"{BASE_URL}/images/jeans.png"),
    Product(id=3, name="Sneakers", description="Running Sneakers", price=2499.50, image=f"{BASE_URL}/images/sneakers.png"),
]
cart: List[CartItem] = []

# ==== Routes ====
@app.get("/products", response_model=List[Product])
def get_products():
    return products

@app.post("/cart/add")
def add_to_cart(item: CartItem):
    if not any(p.id == item.product_id for p in products):
        raise HTTPException(status_code=404, detail="Product not found")
    for cart_item in cart:
        if cart_item.product_id == item.product_id:
            cart_item.quantity += item.quantity
            break
    else:
        cart.append(item)
    return {"message": "Added to cart"}

@app.post("/cart/remove")
def remove_from_cart(item: CartItem):
    global cart
    initial_len = len(cart)
    cart = [ci for ci in cart if ci.product_id != item.product_id]
    if len(cart) == initial_len:
        raise HTTPException(status_code=404, detail="Item not found in cart")
    return {"message": "Removed from cart"}

@app.get("/cart", response_model=List[DetailedCartItem])
def get_cart():
    result = []
    for item in cart:
        product = next((p for p in products if p.id == item.product_id), None)
        if product:
            result.append(DetailedCartItem(
                product_id=item.product_id,
                quantity=item.quantity,
                name=product.name,
                image=product.image
            ))
    return result

@app.post("/signup")
def signup(user: User, db: Session = Depends(get_db)):
    if db.query(UserDB).filter(UserDB.username == user.username).first():
        raise HTTPException(status_code=400, detail="User already exists")
    db_user = UserDB(username=user.username, password=user.password)
    db.add(db_user)
    db.commit()
    return {"message": "Signup successful"}

@app.post("/login")
def login(user: User, db: Session = Depends(get_db)):
    db_user = db.query(UserDB).filter(UserDB.username == user.username).first()
    if not db_user or db_user.password != user.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"message": "Login successful", "user_id": db_user.id}

@app.post("/checkout")
def checkout(data: CheckoutRequest, db: Session = Depends(get_db)):
    items_data = [item.dict() for item in data.items]
    order = OrderDB(
        user_id=None,  # Set if you have authentication implemented
        full_name=data.full_name,
        street=data.street,
        city=data.city,
        state=data.state,
        postal_code=data.postal_code,
        phone=data.phone,
        items_json=json.dumps(items_data)
    )
    db.add(order)
    db.commit()
    cart.clear()
    return {"message": "Order placed successfully", "order_id": order.id}

@app.get("/orders/{user_id}")
def get_orders(user_id: int, db: Session = Depends(get_db)):
    orders = db.query(OrderDB).filter(OrderDB.user_id == user_id).all()
    return [
        {
            "order_id": o.id,
            "full_name": o.full_name,
            "address": f"{o.street}, {o.city}, {o.state}, {o.postal_code}",
            "phone": o.phone,
            "items": json.loads(o.items_json)
        }
        for o in orders
    ]
