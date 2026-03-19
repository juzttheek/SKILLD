import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHandshake, FaMagnifyingGlass, FaStar } from "react-icons/fa6";
import axiosInstance from "../api/axiosInstance";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Footer from "../components/Footer";
import JobCard from "../components/JobCard";
import Navbar from "../components/Navbar";
import ServiceCard from "../components/ServiceCard";
import { useAuth } from "../context/AuthContext";
import "./Home.css";

const serviceCategories = [
  { key: "digital", label: "Digital Services" },
  { key: "local", label: "Local Services" },
  { key: "professional", label: "Professional Services" },
];

const categoryBlocks = [
  {
    key: "digital",
    title: "Digital",
    description: "Design, development, marketing, and content creation from vetted experts.",
    bg: "#EAF3DE",
    icon: "#3B6D11",
  },
  {
    key: "local",
    title: "Local",
    description: "Book nearby pros for repairs, maintenance, moving, and home support.",
    bg: "#FAEEDA",
    icon: "#EF9F27",
  },
  {
    key: "professional",
    title: "Professional",
    description: "Find legal, finance, consulting, and specialist support for business goals.",
    bg: "#EAF3DE",
    icon: "#3B6D11",
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [services, setServices] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoadingServices(true);
        const response = await axiosInstance.get("/api/services?limit=8");
        setServices(response.data?.data || []);
      } catch (error) {
        setServices([]);
      } finally {
        setLoadingServices(false);
      }
    };

    const fetchJobs = async () => {
      try {
        setLoadingJobs(true);
        const response = await axiosInstance.get("/api/jobs?status=open&limit=4");
        setJobs(response.data?.data || []);
      } catch (error) {
        setJobs([]);
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchServices();
    fetchJobs();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    navigate(`/services?search=${encodeURIComponent(search.trim())}`);
  };

  const isClient = user?.role === "client" || user?.role === "both";
  const isWorker = user?.role === "worker" || user?.role === "both";
  const isBoth = user?.role === "both";
  const isGuest = !user;

  return (
    <div className="home-page">
      <Navbar />

      <main className="home-main">
        <section className="hero-section">
          <div className="hero-pattern" aria-hidden="true" />
          <div className="hero-content">
            <h1>Find Trusted Professionals for Any Service</h1>
            <p>
              From digital tasks to local jobs and specialized expertise, ServiceHire helps you
              connect fast and hire confidently.
            </p>

            <form className="hero-search" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search by service, skill, or keyword"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <button type="submit">Search</button>
            </form>

            <div className="hero-filters">
              {serviceCategories.map((item) => (
                <Link key={item.key} to={`/services?category=${item.key}`}>
                  <Badge tone="green">{item.label}</Badge>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="how-it-works section-wrap">
          <h2>How It Works</h2>
          <div className="how-grid">
            <article className="how-card">
              <span className="step-bg">01</span>
              <FaMagnifyingGlass size={26} color="#3B6D11" />
              <h3>Browse or Post</h3>
              <p>Find a service instantly or post your project to receive proposals.</p>
            </article>

            <article className="how-card">
              <span className="step-bg">02</span>
              <FaHandshake size={26} color="#EF9F27" />
              <h3>Connect &amp; Hire</h3>
              <p>Review profiles, compare offers, and choose the right professional.</p>
            </article>

            <article className="how-card">
              <span className="step-bg">03</span>
              <FaStar size={26} color="#3B6D11" />
              <h3>Get it Done</h3>
              <p>Collaborate with confidence and leave a review after completion.</p>
            </article>
          </div>
        </section>

        {(isGuest || isClient) ? (
          <section className="section-wrap">
            <div className="section-head">
              <h2>Popular Services</h2>
              <Link to="/services">Browse All →</Link>
            </div>

            <div className="services-grid">
              {loadingServices
                ? Array.from({ length: 8 }).map((_, index) => (
                    <div key={`service-skeleton-${index}`} className="card-skeleton" />
                  ))
                : services.map((service) => <ServiceCard key={service._id} service={service} />)}
            </div>
          </section>
        ) : null}

        {(isGuest || isWorker) ? (
          <section className="section-wrap">
            <div className="section-head">
              <h2>Recent Job Posts</h2>
              <Link to="/jobs">View All Jobs →</Link>
            </div>

            <div className="jobs-grid">
              {loadingJobs
                ? Array.from({ length: 4 }).map((_, index) => (
                    <div key={`job-skeleton-${index}`} className="card-skeleton job-skeleton" />
                  ))
                : jobs.map((job) => (
                    <JobCard
                      key={job._id}
                      job={job}
                      onViewApply={() => navigate(`/jobs/${job._id}`)}
                    />
                  ))}
            </div>

            {isGuest ? (
              <div className="jobs-cta-wrap">
                <Link to="/post-job">
                  <Button variant="primary" size="lg">
                    Post a Job for Free
                  </Button>
                </Link>
              </div>
            ) : null}
          </section>
        ) : null}

        <section className="section-wrap">
          <h2>Explore by Category</h2>
          <div className="categories-grid">
            {categoryBlocks.map((item) => (
              <article key={item.key} className="category-banner" style={{ background: item.bg }}>
                <div className="category-icon" style={{ color: item.icon }}>
                  ●
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <Link to={`/services?category=${item.key}`}>Explore →</Link>
              </article>
            ))}
          </div>
        </section>

        {isGuest ? (
          <section className="cta-banner">
            <div className="cta-content">
              <h2>Are you a skilled professional?</h2>
              <p>Create your profile, showcase your strengths, and get hired by quality clients.</p>
              <div className="cta-actions">
                <Link to="/register">
                  <Button variant="secondary" size="lg">
                    Join as Worker
                  </Button>
                </Link>
                <Link to="/services">
                  <Button
                    variant="outline"
                    size="lg"
                    style={{ borderColor: "#FFFFFF", color: "#FFFFFF", background: "transparent" }}
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        {isClient && !isBoth ? (
          <section className="cta-banner">
            <div className="cta-content">
              <h2>Need to hire for a new project?</h2>
              <p>Post your job and get proposals from qualified workers fast.</p>
              <div className="cta-actions">
                <Link to="/post-job">
                  <Button variant="secondary" size="lg">
                    Post a Job
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        {isWorker && !isBoth ? (
          <section className="cta-banner">
            <div className="cta-content">
              <h2>Ready to attract more clients?</h2>
              <p>Publish your service and start receiving direct inquiries.</p>
              <div className="cta-actions">
                <Link to="/create-service">
                  <Button variant="secondary" size="lg">
                    Create Service
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        {isBoth ? (
          <section className="cta-banner">
            <div className="cta-content">
              <h2>Manage work from both sides</h2>
              <p>Post jobs for hiring and publish services to win projects.</p>
              <div className="cta-actions">
                <Link to="/post-job">
                  <Button variant="secondary" size="lg">
                    Post a Job
                  </Button>
                </Link>
                <Link to="/create-service">
                  <Button
                    variant="outline"
                    size="lg"
                    style={{ borderColor: "#FFFFFF", color: "#FFFFFF", background: "transparent" }}
                  >
                    Create Service
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <Footer />
    </div>
  );
};

export default Home;
