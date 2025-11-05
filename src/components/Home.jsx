import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Mic } from "lucide-react";
import toast from "react-hot-toast";

let recognitionInstance = null;
let isListening = false;

export default function Home() {
  const [totals, setTotals] = useState({});
  const [topProducts, setTopProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [dailySales, setDailySales] = useState([]);
  const [range, setRange] = useState(7);
  const [summary, setSummary] = useState("Say 'Hello Gemini' to begin...");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [totalsRes, topRes, dailyRes, stockRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_BK_URL}/api/dashboard/totals`),
          fetch(`${import.meta.env.VITE_BK_URL}/api/dashboard/top-products`),
          fetch(
            `${
              import.meta.env.VITE_BK_URL
            }/api/dashboard/daily-sales?days=${range}`
          ),
          fetch(`${import.meta.env.VITE_BK_URL}/api/products/low-stock`),
        ]);

        const [totals, top, daily, stock] = await Promise.all([
          totalsRes.json(),
          topRes.json(),
          dailyRes.json(),
          stockRes.json(),
        ]);

        const getPastNDates = (n) => {
          const dates = [];
          const today = new Date();
          for (let i = n - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const iso = date.toISOString().split("T")[0];
            const label = date.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            });
            dates.push({ iso, label });
          }
          return dates;
        };

        const formattedSales = getPastNDates(range).map(({ iso, label }) => {
          const match = daily.find((d) => d._id === iso);
          return { name: label, sales: match ? match.dailyRevenue : 0 };
        });

        setTotals(totals);
        setTopProducts(top);
        setDailySales(formattedSales);
        setLowStock(stock);
      } catch (err) {
        toast.dismiss("Dashboard fetch error");
      }
    };

    fetchData();
  }, [range]);

  const handleVoiceCommand = () => {
    if (isListening) return;
    isListening = true;

    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognitionInstance = recognition;

    const speakText = (text) => {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
      return new Promise((resolve) => (utterance.onend = resolve));
    };

    const startListening = () => recognition.start();

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      setSummary("Processing...");

      if (transcript.includes("hello gemini")) {
        await speakText("Hello sir, how can I assist you?");
        startListening();
      } else {
        try {
          const dashboardData = { totals, topProducts, lowStock, dailySales };
          const res = await fetch(
            `${import.meta.env.VITE_BK_URL}/api/gemini/summarize`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ query: transcript, dashboardData }),
            }
          );
          const data = await res.json();
          setSummary(data.output);
          await speakText(data.output);
          startListening();
        } catch {
          setSummary("There was an error processing your request.");
          await speakText("There was an error processing your request.");
        }
      }
    };

    recognition.onerror = () => startListening();
    startListening();
  };

  const stopAI = () => {
    if (recognitionInstance) recognitionInstance.abort();
    window.speechSynthesis.cancel();
    isListening = false;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 gap-6 bg-white text-gray-800 min-h-screen">
      <div className="bg-white border border-gray-200 rounded-2xl shadow p-4 sm:p-6 text-center sm:text-left">
        <h2 className="text-lg sm:text-xl font-semibold text-[#0071dc] mb-2">
          Total Sales
        </h2>
        <p className="text-2xl sm:text-3xl font-bold text-[#0071dc]">
          ₹{totals.totalRevenue || 0}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold text-[#0071dc] mb-2">
            Revenue & Profit
          </h2>
          <p className="text-sm sm:text-base text-gray-700">
            Revenue: ₹{totals.totalRevenue || 0}
          </p>
          <p className="text-sm sm:text-base text-gray-700">
            Profit: ₹{totals.totalProfit || 0}
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-[#0071dc] mb-2">
            Low Stock Alerts
          </h2>
          {lowStock.length === 0 ? (
            <p className="text-gray-600">Nothing to restock!!</p>
          ) : (
            <ul className="list-disc pl-4 text-sm text-gray-700 space-y-1">
              {lowStock.map((item) => (
                <li key={item._id}>
                  {item.name} ({item.quantity} left)
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-[#0071dc] mb-4">
          Top 5 Selling Products
        </h2>
        <ul className="text-sm grid grid-cols-1 sm:grid-cols-2 gap-3">
          {topProducts.map((product, index) => (
            <li
              key={index}
              className="flex justify-between border-b border-gray-300 py-2 text-gray-700"
            >
              <span>{product._id}</span>
              <span className="text-[#0071dc] font-semibold">
                {product.totalSold} units
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 className="text-lg sm:text-xl font-semibold text-[#0071dc]">
            Talk with AI
          </h2>
          <div className="flex items-center gap-3">
            <Mic
              className="h-6 w-6 text-[#0071dc] cursor-pointer"
              onClick={handleVoiceCommand}
              title="Click to speak"
            />
            <button
              onClick={stopAI}
              className="text-xs px-3 py-1 bg-[#0071dc] text-white rounded hover:bg-[#005bb5]"
            >
              Stop AI
            </button>
          </div>
        </div>

        <div
          className="text-sm text-gray-700 leading-relaxed overflow-y-auto pr-2"
          style={{ maxHeight: "160px", scrollbarWidth: "thin" }}
        >
          {summary === "Processing..." ? (
            <div className="flex items-center gap-2 text-gray-500">
              <svg
                className="animate-spin h-4 w-4 text-[#0071dc]"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              <span>Processing...</span>
            </div>
          ) : (
            <p className="whitespace-pre-line">{summary}</p>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow p-4 sm:p-6">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-[#0071dc]">
            Sales Trends
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setRange(7)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                range === 7
                  ? "bg-[#0071dc] text-white"
                  : "bg-white text-gray-700 border border-gray-300"
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setRange(30)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                range === 30
                  ? "bg-[#0071dc] text-white"
                  : "bg-white text-gray-700 border border-gray-300"
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        <div className="h-[220px] sm:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dailySales}
              margin={{ top: 10, right: 30, bottom: 40 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#ccc"
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#333" }}
                angle={-25}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#333" }}
                tickFormatter={(v) => `₹${v}`}
              />
              <Tooltip
                formatter={(v) => `₹${v}`}
                contentStyle={{
                  backgroundColor: "#f9fafb",
                  borderColor: "#e5e7eb",
                }}
              />
              <Bar
                dataKey="sales"
                fill="#0071dc"
                radius={[6, 6, 0, 0]}
                barSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
