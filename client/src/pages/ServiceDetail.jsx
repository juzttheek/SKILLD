import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Footer from "../components/Footer";
import Modal from "../components/Modal";
import Navbar from "../components/Navbar";
import ReviewCard from "../components/ReviewCard";
import StarRating from "../components/StarRating";
import { useAuth } from "../context/AuthContext";
import "./ServiceDetail.css";

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/services/${id}`);
        const serviceData = response.data;
        setService(serviceData);

        if (serviceData?.worker?._id) {
          const reviewResponse = await axiosInstance.get(`/api/reviews/user/${serviceData.worker._id}`);
          setReviews(reviewResponse.data || []);
        }
      } catch (error) {
        setService(null);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const images = useMemo(() => {
    const list = service?.images?.length
      ? service.images
      : ["https://via.placeholder.com/960x540?text=Service+Image"];

    const withFallbacks = [...list];
    while (withFallbacks.length < 4) {
      withFallbacks.push("https://via.placeholder.com/320x180?text=Preview");
    }
    return withFallbacks.slice(0, 5);
  }, [service]);

  if (loading) {
    return (
      <div className="service-detail-page">
        <Navbar />
        <main className="service-detail-main">
          <div className="sd-skeleton" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="service-detail-page">
        <Navbar />
        <main className="service-detail-main">
          <div className="sd-empty">
            <h2>Service not found</h2>
            <Link to="/services">Back to services</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="service-detail-page">
      <Navbar />

      <main className="service-detail-main">
        <div className="sd-layout">
          <section className="sd-left">
            <div className="sd-gallery">
              <img src={images[activeImage]} alt={service.title} className="sd-main-image" />
              <div className="sd-thumbs">
                {images.slice(0, 4).map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    className={index === activeImage ? "active" : ""}
                    onClick={() => setActiveImage(index)}
                  >
                    <img src={image} alt={`Thumbnail ${index + 1}`} />
                  </button>
                ))}
              </div>
            </div>

            <h1>{service.title}</h1>

            <div className="sd-badges">
              <Badge tone="green">{service.category}</Badge>
              {(service.tags || []).map((tag) => (
                <Badge key={tag} tone="green">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="sd-description">
              <h2>Description</h2>
              <p>{service.description}</p>
            </div>

            <div className="sd-reviews">
              <h2>Reviews</h2>
              {reviews.length === 0 ? (
                <p className="sd-muted">No reviews yet.</p>
              ) : (
                <div className="sd-review-list">
                  {reviews.map((review) => (
                    <ReviewCard key={review._id} review={review} />
                  ))}
                </div>
              )}
            </div>
          </section>

          <aside className="sd-right">
            <div className="sd-side-card">
              <p className="sd-price">${service.price ?? 0}</p>
              <p className="sd-pricing-type">{service.pricingType || "fixed"}</p>

              <p className="sd-meta">Delivery Time: {service.deliveryTime || "Flexible"}</p>

              <Button
                variant="primary"
                size="lg"
                className="sd-contact-btn"
                onClick={() => {
                  if (!user) {
                    setShowAuthModal(true);
                    return;
                  }
                  navigate(`/messages/${service.worker?._id}`);
                }}
              >
                Contact Worker
              </Button>

              <div className="sd-worker-mini">
                <img
                  src={service.worker?.avatar || "https://via.placeholder.com/80?text=U"}
                  alt={service.worker?.name || "Worker"}
                />
                <div>
                  <p className="sd-worker-name">{service.worker?.name || "Unknown Worker"}</p>
                  <StarRating rating={service.worker?.rating || 0} size={14} />
                  <p className="sd-muted">{service.totalReviews || 0} reviews</p>
                  <p className="sd-muted">{service.worker?.location || "Location not specified"}</p>
                </div>
              </div>

              <Link to={`/worker/${service.worker?._id}`} className="sd-profile-link">
                View Full Profile
              </Link>
            </div>
          </aside>
        </div>
      </main>

      <Modal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Please log in to contact this worker"
      >
        <div className="sd-auth-modal-content">
          <p>You need an account before sending messages.</p>
          <div className="sd-auth-modal-actions">
            <Link to="/login">
              <Button variant="primary">Login</Button>
            </Link>
            <Link to="/register">
              <Button variant="outline">Register</Button>
            </Link>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
};

export default ServiceDetail;
