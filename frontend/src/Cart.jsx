// src/Cart.jsx
import { useNavigate } from "react-router-dom";

function Cart({ cartItems, onRemove }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-r from-yellow-100 to-orange-100 p-10">
      <h1 className="text-3xl font-bold text-center text-orange-700 mb-6">
        🛒 Your Cart
      </h1>

      {cartItems.length === 0 ? (
        <p className="text-center text-gray-700">Your cart is empty.</p>
      ) : (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md">
          {cartItems.map((item) => (
            <div
              key={item.product_id}
              className="mb-4 border-b pb-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <p className="text-lg font-medium">{item.name}</p>
                  <p className="text-gray-600">Quantity: {item.quantity}</p>
                </div>
              </div>
              <button
                className="text-red-600 font-bold"
                onClick={() => {
                  if (item.product_id) {
                    onRemove(item.product_id);
                  } else {
                    console.error("Missing product_id for:", item);
                  }
                }}
              >
                ❌ Remove
              </button>
            </div>
          ))}

          <button
            onClick={() => navigate("/checkout")}
            className="mt-4 w-full bg-green-500 text-white py-2 rounded-full hover:bg-green-700"
          >
            Proceed to Buy
          </button>
        </div>
      )}
    </div>
  );
}

export default Cart;
