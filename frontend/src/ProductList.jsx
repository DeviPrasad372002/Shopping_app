import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ProductList({ onAddToCart, cartCount, isLoggedIn }) {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8000/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-blue-100 p-10">
      <h1 className="text-4xl font-bold text-center text-purple-700 mb-6">
        🛍️ Shopping Store
      </h1>
      <div className="flex justify-between mb-4">
        {isLoggedIn ? null : (
          <button
            onClick={() => navigate("/login")}
            className="bg-gray-800 text-white px-4 py-2 rounded-full font-semibold"
          >
            🔐 Login
          </button>
        )}
        <button
          onClick={() => navigate("/cart")}
          className="bg-purple-600 text-white px-4 py-2 rounded-full font-semibold"
        >
          🛒 Cart: {cartCount}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h2 className="text-xl font-semibold text-purple-800">
              {product.name}
            </h2>
            <p className="text-gray-600">{product.description}</p>
            <p className="text-green-600 font-bold mt-2">₹{product.price}</p>
            <button
              className="mt-4 bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-purple-700"
              onClick={() => onAddToCart(product.id)}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;