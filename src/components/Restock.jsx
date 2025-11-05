import React, { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";

export default function Restock() {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [restockQuantities, setRestockQuantities] = useState({});

  const fetchLowStock = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/products/low-stock");
      const data = await res.json();
      setLowStockItems(data);
    } catch (err) {
      console.error("Failed to fetch low stock items:", err);
    }
  };

  useEffect(() => {
    fetchLowStock();
  }, []);

  const handleRestock = async (productId) => {
    const quantity = restockQuantities[productId] || 0;
    if (quantity <= 0) return toast.error("Please enter a valid quantity.");

    try {
      const res = await fetch("http://localhost:5000/api/restockproducts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success("Product restocked!");
        setRestockQuantities((prev) => ({ ...prev, [productId]: 0 }));
        setLowStockItems((prev) =>
          prev.filter((item) => item._id !== productId)
        );
      } else {
        toast.error(result.error || "Failed to restock.");
      }
    } catch {
      toast.error("Server error occurred.");
    }
  };

  const handleQuantityChange = (id, value) => {
    const qty = parseInt(value);
    if (!isNaN(qty)) setRestockQuantities((prev) => ({ ...prev, [id]: qty }));
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 p-4 sm:p-6 lg:p-8">
      <Toaster position="top-center" />
      <h1 className="text-2xl sm:text-3xl font-bold text-[#0071dc] mb-6 text-center">
        Restock Products
      </h1>

      {lowStockItems.length === 0 ? (
        <p className="text-center text-gray-500 text-lg sm:text-xl">
          No items to restock
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {lowStockItems.map((product) => (
            <div
              key={product._id}
              className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col hover:shadow-md transition"
            >
              <img
                src={
                  product?.imgUrl?.startsWith("data:image")
                    ? product.imgUrl
                    : product?.imgUrl ||
                      product?.imgurl ||
                      "https://via.placeholder.com/150"
                }
                alt={product?.name || "Product"}
                className="w-full h-40 object-contain rounded-md mb-4 bg-gray-100"
                onError={(e) =>
                  (e.target.src = "https://via.placeholder.com/150")
                }
              />

              <h2 className="text-lg sm:text-xl font-semibold text-[#0071dc] mb-1 truncate">
                {product.name || "Unnamed Product"}
              </h2>

              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {product.description || "No description available."}
              </p>

              <div className="text-sm mb-3 space-y-1 text-gray-700">
                <p>
                  <span className="font-medium">Price:</span> ₹
                  {product.price || "N/A"}
                </p>
                <p>
                  <span className="font-medium">In Stock:</span>{" "}
                  {product.quantity ?? "?"}
                </p>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <input
                  type="number"
                  placeholder="Qty"
                  value={restockQuantities[product._id] || ""}
                  onChange={(e) =>
                    handleQuantityChange(product._id, e.target.value)
                  }
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#0071dc]"
                  min="1"
                />
              </div>

              <button
                onClick={() => handleRestock(product._id)}
                className="bg-[#0071dc] text-white py-2 px-4 rounded hover:bg-[#005bb5] text-sm mt-auto transition"
              >
                Restock
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
