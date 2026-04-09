import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import TopSection from "./components/TopSection";
import CategoriesSection from "./components/TagSection";
import Cards from "./components/Cards";
import Divider from "./components/Divider";
import FAQ from "./components/FAQ";
import ImageStrip from "./components/Slider";
import CTABanner from "./components/FooterBanner";
import UseCases from "./components/UseCases";
import { BASE_URL } from "./baseurl";

import { useNavigate } from "react-router-dom";
export default function Home() {
  const [trends, setTrends] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filtering, setFiltering] = useState(false);
  const [popularTrends, setPopularTrends] = useState([]);

  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
const navigate=useNavigate();
 
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [trendsRes, categoriesRes] = await Promise.all([
          axios.get(`${BASE_URL}/homepage-trends`, { headers }),
          axios.get(`${BASE_URL}/categories`, { headers }),
        ]);
        setTrends(trendsRes.data.trends);
        setPopularTrends(trendsRes.data.popularTrends);
        setCategories(categoriesRes.data.categories);
      } catch (e) {
        toast.error("Failed to load homepage data. Please try again.", {
          containerId: "home-toast",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);


  useEffect(() => {
    if (loading) return;
    const filterTrends = async () => {
      setFiltering(true);
      try {
        const params = selectedCategory ? { category: selectedCategory } : {};
        const res = await axios.get(`${BASE_URL}/homepage-trends`, {
          headers,
          params,
        });
        setTrends(res.data.trends);
  
        
        const selectedCat = categories.find(c => c._id === selectedCategory);
        if (selectedCat) {
          navigate(`/?category=${selectedCat.slug}`, { replace: true });
        } else {
          navigate(`/`, { replace: true });
        }
      } catch (e) {
        toast.error("Failed to filter trends.", { containerId: "home-toast" });
      } finally {
        setFiltering(false);
      }
    };
    filterTrends();
  }, [selectedCategory]);

  return (
    <div className="space-y-16 overflow-x-hidden">
      <ToastContainer containerId="home-toast" position="top-right" autoClose={4000} />
      <TopSection trends={trends} popularTrends={popularTrends} loading={loading} filtering={filtering} />
      <CategoriesSection
        categories={categories}
        loading={loading}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        trends={trends}
      />
      <Divider />
      <UseCases/>
      <Cards />
      <FAQ />
      <ImageStrip />
      <CTABanner />
    </div>
  );
}