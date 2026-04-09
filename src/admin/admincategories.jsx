import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../baseurl";

const TOAST_ID = "category-toast";
const api = axios.create({ baseURL: BASE_URL });
const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
});

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName]             = useState("");
  const [slug, setSlug]             = useState("");
  const [loading, setLoading]       = useState(false);
  const [fetching, setFetching]     = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/admin/categories", authHeader());
      setCategories(data.categories || []);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      }
      toast.error("Failed to load categories.", { containerId: TOAST_ID });
    } finally {
      setFetching(false);
    }
  };

  const handleNameChange = (val) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
  };

  const handleCreate = async () => {
    if (!name || !slug) {
      toast.error("Name and slug are required.", { containerId: TOAST_ID });
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/admin/categories", { name, slug }, authHeader());
      setCategories((prev) => [data.category, ...prev]);
      setName("");
      setSlug("");
      toast.success("Category created!", { containerId: TOAST_ID });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create.", { containerId: TOAST_ID });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this category?")) return;
    try {
      await api.delete(`/admin/categories/${id}`, authHeader());
      setCategories((prev) => prev.filter((c) => c._id !== id));
      toast.success("Category deleted.", { containerId: TOAST_ID });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete.", { containerId: TOAST_ID });
    }
  };

  return (
    <>
      <ToastContainer containerId={TOAST_ID} position="top-center" autoClose={4000} theme="dark" />
      <div className="bg-black text-white min-h-screen">
     
        <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <h1 className="font-black text-white text-xl tracking-tight">
            TikTok<span className="text-[#D4F244]">Slang</span>
            <span className="text-zinc-500 text-sm font-normal ml-2">Admin</span>
          </h1>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="text-sm text-zinc-500 hover:text-white transition px-3 py-2 rounded-xl border border-zinc-800 hover:border-zinc-600"
          >
            ← Dashboard
          </button>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-8">
          <h2 className="text-xl font-black mb-1">Categories</h2>
          <p className="text-zinc-500 text-xs mb-8">Manage trend categories.</p>

          
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
            <h3 className="text-sm font-bold mb-4">New Category</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-500 block mb-1.5">Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Fitness"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-zinc-500 transition"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1.5">Slug *</label>
                <input
                  type="text"
                  placeholder="fitness"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-zinc-500 transition font-mono"
                />
              </div>
              <button
                onClick={handleCreate}
                disabled={loading}
                className="w-full font-bold py-3 rounded-xl text-sm hover:opacity-90 transition disabled:opacity-50"
                style={{ background: "#D4F244", color: "#000", cursor: loading ? "not-allowed" : "pointer" }}
              >
                {loading ? "Creating…" : "Create Category"}
              </button>
            </div>
          </div>

         
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold text-sm">All Categories</h3>
              <span className="text-zinc-500 text-xs">{categories.length} items</span>
            </div>

            {fetching ? (
              <div className="py-12 text-center text-zinc-600 text-sm">Loading…</div>
            ) : categories.length === 0 ? (
              <div className="py-12 text-center text-zinc-600 text-sm">No categories yet.</div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {categories.map((cat) => (
                  <div
                    key={cat._id}
                    className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-zinc-800/40 transition"
                  >
                    <div>
                      <p className="text-sm font-medium">{cat.name}</p>
                      <p className="text-xs text-zinc-500 font-mono">/{cat.slug}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-600 hover:text-red-400 hover:border-red-900 transition"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}