import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ProductList from "./ProductList";
import Cart from "./Cart";
import Checkout from "./Checkout";
import Login from "./Login";

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  function fetchCart() {
    fetch("http://localhost:8000/cart")
      .then((res) => res.json())
      .then((data) => {
        setCartItems(data);
        setCartCount(data.reduce((sum, item) => sum + item.quantity, 0));
      });
  }

  function handleAddToCart(productId) {
    fetch("http://localhost:8000/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId, quantity: 1 }),
    }).then(() => fetchCart());
  }

  function handleRemoveFromCart(productId) {
    fetch("http://localhost:8000/cart/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId }),
    }).then(() => fetchCart());
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/products"
          element={<ProductList onAddToCart={handleAddToCart} cartCount={cartCount} isLoggedIn={isLoggedIn} />}
        />
        <Route
          path="/cart"
          element={<Cart cartItems={cartItems} onRemove={handleRemoveFromCart} />}
        />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
      </Routes>
    </Router>
  );
}

export default App;