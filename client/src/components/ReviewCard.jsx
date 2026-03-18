import StarRating from "./StarRating";
import "./components.css";

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString();
};

const ReviewCard = ({ review = {} }) => {
  const reviewerName = review.reviewer?.name || "Anonymous";
  const reviewerAvatar = review.reviewer?.avatar || "https://via.placeholder.com/60?text=U";

  return (
    <article className="sh-review-card">
      <img src={reviewerAvatar} alt={reviewerName} className="sh-review-avatar" />
      <div>
        <div className="sh-review-head">
          <p className="sh-review-name">{reviewerName}</p>
          <span className="sh-review-date">{formatDate(review.createdAt)}</span>
        </div>
        <StarRating rating={review.rating || 0} size={14} />
        <p className="sh-review-comment">{review.comment || "No comment provided."}</p>
      </div>
    </article>
  );
};

export default ReviewCard;
