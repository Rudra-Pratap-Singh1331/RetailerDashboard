import React, { useState } from "react";
import axios from "axios";
import { Mic } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

const Addproduct = () => {
  const [formData, setFormData] = useState({
    name: "",
    imgUrl: "",
    price: "",
    quantity: "",
    costprice: "",
    description: "",
    category: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await axios.post(
        `${import.meta.env.VITE_BK_URL}/api/product/addProduct`,
        formData,
        { withCredentials: true }
      );
      toast.success("Product added!");
      setFormData({
        name: "",
        imgUrl: "",
        price: "",
        quantity: "",
        costprice: "",
        description: "",
        category: "",
      });
     
    } catch (error) {
      toast.error("Failed to add product.");
    }
  };

  const handleFillWithAI = () => {
    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    recognition.lang = "en-IN";
    recognition.interimResults = false;

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      toast.loading("Processing with AI...");
      try {
        const res = await fetch("http://localhost:5000/api/ai/fill-product", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: transcript }),
        });
        const data = await res.json();
     
        toast.dismiss();
        if (!data.output || typeof data.output !== "object") {
          toast.error("Invalid AI response format.");
          return;
        }
        setFormData((prev) => ({ ...prev, ...data.output }));
        toast.success("Form filled with AI!");
      } catch (err) {
        toast.dismiss();
        toast.error("AI fill error: " + err.message);
      }
    };

    recognition.start();
  };

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      <Toaster />
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-xl p-4 sm:p-6 lg:p-8 shadow-md">
        <h2 className="text-xl sm:text-2xl font-semibold text-[#0071dc] text-center mb-4">
          Add New Product
        </h2>

        <div className="flex justify-end mb-3">
          <button
            onClick={handleFillWithAI}
            className="flex items-center gap-2 text-sm bg-[#0071dc] text-white px-3 py-1.5 rounded hover:bg-[#005bb5] transition"
          >
            <Mic size={16} /> Fill with AI
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#0071dc] text-sm font-medium mb-1">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0071dc] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#0071dc] text-sm font-medium mb-1">
                Product Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file && file.size > 2 * 1024 * 1024) {
                    toast.error("Image too large. Max 2MB allowed.");
                    return;
                  }
                  const reader = new FileReader();
                  reader.onloadend = () =>
                    setFormData((p) => ({ ...p, imgUrl: reader.result }));
                  if (file) reader.readAsDataURL(file);
                }}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 file:bg-[#0071dc] file:text-white"
              />
              {formData.imgUrl && (
                <img
                  src={formData.imgUrl}
                  alt="Preview"
                  className="w-28 sm:w-32 h-28 sm:h-32 object-cover rounded mt-3 border mx-auto"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#0071dc] text-sm font-medium mb-1">
                Price (₹)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0071dc]"
              />
            </div>
            <div>
              <label className="block text-[#0071dc] text-sm font-medium mb-1">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0071dc]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#0071dc] text-sm font-medium mb-1">
                Cost Price
              </label>
              <input
                type="number"
                name="costprice"
                value={formData.costprice}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0071dc]"
              />
            </div>
            <div>
              <label className="block text-[#0071dc] text-sm font-medium mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-[#0071dc]"
              >
                <option value="">Select Category</option>
                <option value="shoes">Shoes</option>
                <option value="furniture">Furniture</option>
                <option value="mobile">Mobile</option>
                <option value="electronics">Laptop</option>
                <option value="grocery">Grocery</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#0071dc] text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="3"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0071dc] resize-none"
            />
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="bg-[#0071dc] text-white text-sm font-medium px-6 py-2 rounded-lg hover:bg-[#005bb5] transition"
            >
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Addproduct;
