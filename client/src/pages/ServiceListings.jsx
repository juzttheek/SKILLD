import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Button from "../components/Button";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ServiceCard from "../components/ServiceCard";
import "./ServiceListings.css";

const CATEGORY_OPTIONS = [
  { value: "digital", label: "Digital" },
  { value: "local", label: "Local" },
  { value: "professional", label: "Professional" },
];

const PRICING_TYPES = ["any", "fixed", "hourly", "negotiable"];

const ServiceListings = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [searchInput, setSearchInput] = useState(params.get("search") || "");
  const [categories, setCategories] = useState(
    params.get("category") ? params.get("category").split(",") : []
  );
  const [minPrice, setMinPrice] = useState(params.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") || "");
  const [pricingType, setPricingType] = useState(params.get("pricingType") || "any");
  const [sortBy, setSortBy] = useState(params.get("sort") || "newest");
  const [page, setPage] = useState(Number(params.get("page") || 1));

  const limit = 9;

  useEffect(() => {
    const query = new URLSearchParams();
    if (searchInput.trim()) query.set("search", searchInput.trim());
    if (categories.length > 0) query.set("category", categories.join(","));
    if (minPrice) query.set("minPrice", minPrice);
    if (maxPrice) query.set("maxPrice", maxPrice);
    if (pricingType && pricingType !== "any") query.set("pricingType", pricingType);
    if (sortBy && sortBy !== "newest") query.set("sort", sortBy);
    query.set("page", String(page));
    query.set("limit", String(limit));
    setParams(query, { replace: true });
  }, [searchInput, categories, minPrice, maxPrice, pricingType, sortBy, page, setParams]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const query = new URLSearchParams();
        if (searchInput.trim()) query.set("search", searchInput.trim());
        if (categories.length > 0) query.set("category", categories.join(","));
        if (minPrice) query.set("minPrice", minPrice);
        if (maxPrice) query.set("maxPrice", maxPrice);
        if (pricingType && pricingType !== "any") query.set("pricingType", pricingType);
        query.set("page", String(page));
        query.set("limit", String(limit));

        const response = await axiosInstance.get(`/api/services?${query.toString()}`);
        setServices(response.data?.data || []);
        setTotalCount(response.data?.totalCount || 0);
        setTotalPages(response.data?.totalPages || 1);
      } catch (error) {
        setServices([]);
        setTotalCount(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [searchInput, categories, minPrice, maxPrice, pricingType, page]);

  const sortedServices = useMemo(() => {
    const items = [...services];
    if (sortBy === "price-low-high") {
      items.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price-high-low") {
      items.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "top-rated") {
      items.sort((a, b) => (b.worker?.rating || 0) - (a.worker?.rating || 0));
    } else {
      items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    return items;
  }, [services, sortBy]);

  const toggleCategory = (value) => {
    setPage(1);
    setCategories((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const clearFilters = () => {
    setCategories([]);
    setMinPrice("");
    setMaxPrice("");
    setPricingType("any");
    setSearchInput("");
    setSortBy("newest");
    setPage(1);
  };

  const applyFilters = () => {
    setPage(1);
    setDrawerOpen(false);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

    return (
      <div className="svc-pagination">
        <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
          Prev
        </button>
        {pageNumbers.map((value) => (
          <button
            key={value}
            type="button"
            className={value === page ? "active" : ""}
            onClick={() => setPage(value)}
          >
            {value}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    );
  };

  const filterPanel = (
    <div className="svc-filters-panel">
      <div className="svc-filter-group">
        <p className="svc-filter-title">Category</p>
        {CATEGORY_OPTIONS.map((item) => (
          <label key={item.value} className="svc-check-row">
            <input
              type="checkbox"
              checked={categories.includes(item.value)}
              onChange={() => toggleCategory(item.value)}
            />
            <span>{item.label}</span>
          </label>
        ))}
      </div>

      <div className="svc-filter-group">
        <p className="svc-filter-title">Price Range</p>
        <div className="svc-price-grid">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
          />
        </div>
      </div>

      <div className="svc-filter-group">
        <p className="svc-filter-title">Pricing Type</p>
        {PRICING_TYPES.map((value) => (
          <label key={value} className="svc-check-row">
            <input
              type="radio"
              name="pricingType"
              checked={pricingType === value}
              onChange={() => setPricingType(value)}
            />
            <span>{value === "any" ? "Any" : value[0].toUpperCase() + value.slice(1)}</span>
          </label>
        ))}
      </div>

      <button type="button" className="svc-clear-link" onClick={clearFilters}>
        Clear Filters
      </button>

      <Button variant="primary" className="svc-apply-btn" onClick={applyFilters}>
        Apply Filters
      </Button>
    </div>
  );

  return (
    <div className="service-listings-page">
      <Navbar />
      <main className="service-listings-main">
        <div className="svc-layout">
          <aside className="svc-sidebar">{filterPanel}</aside>

          <section className="svc-results">
            <div className="svc-topbar">
              <input
                type="text"
                placeholder="Search services"
                value={searchInput}
                onChange={(event) => {
                  setSearchInput(event.target.value);
                  setPage(1);
                }}
              />

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                aria-label="Sort services"
              >
                <option value="newest">Newest</option>
                <option value="price-low-high">Price Low-High</option>
                <option value="price-high-low">Price High-Low</option>
                <option value="top-rated">Top Rated</option>
              </select>

              <button type="button" className="svc-mobile-filter-btn" onClick={() => setDrawerOpen(true)}>
                Filter
              </button>
            </div>

            <p className="svc-results-count">{totalCount} services found</p>

            {loading ? (
              <div className="svc-grid">
                {Array.from({ length: 9 }).map((_, index) => (
                  <div key={`skeleton-${index}`} className="svc-card-skeleton" />
                ))}
              </div>
            ) : sortedServices.length === 0 ? (
              <div className="svc-empty">
                <div className="svc-empty-illustration">🔍</div>
                <h2>No services found</h2>
                <p>Try adjusting filters or search for another keyword.</p>
              </div>
            ) : (
              <>
                <div className="svc-grid">
                  {sortedServices.map((service) => (
                    <Link key={service._id} to={`/services/${service._id}`} className="svc-card-link">
                      <ServiceCard service={service} />
                    </Link>
                  ))}
                </div>
                {renderPagination()}
              </>
            )}
          </section>
        </div>
      </main>

      <div className={`svc-drawer-backdrop ${drawerOpen ? "open" : ""}`.trim()}>
        <div className="svc-drawer">
          <div className="svc-drawer-head">
            <h3>Filters</h3>
            <button type="button" onClick={() => setDrawerOpen(false)}>
              Close
            </button>
          </div>
          {filterPanel}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ServiceListings;
