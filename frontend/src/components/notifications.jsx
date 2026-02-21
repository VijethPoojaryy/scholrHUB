/**
 * components/rating/RatingPanel.jsx
 * ─────────────────────────────────────────────────────────────
 * Full rating + review section shown on a resource detail view.
 * Fetches existing ratings, shows average, lets user submit review.
 */

import { useState, useEffect } from "react";
import StarRating      from "./StarRating";
import { ratingService } from "../../services/api";
import { useAuth }     from "../../context/AuthContext";
import { useToast }    from "../../context/ToastContext";
import { timeAgo, getInitials, getAvatarColor } from "../../utils/helpers";
import "./RatingPanel.css";

export default function RatingPanel({ resourceId }) {
  const { user, isAdmin } = useAuth();
  const toast = useToast();

  const [ratings,  setRatings]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [myRating, setMyRating] = useState(0);
  const [myReview, setMyReview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const average    = ratings.length ? ratings.reduce((a, r) => a + r.value, 0) / ratings.length : 0;
  const myExisting = ratings.find(r => r.user?._id === user?._id || r.userId === user?._id);

  useEffect(() => {
    if (!resourceId) return;
    ratingService.getForResource(resourceId)
      .then(data => {
        setRatings(data || []);
        const mine = data?.find(r => r.user?._id === user?._id || r.userId === user?._id);
        if (mine) { setMyRating(mine.value); setMyReview(mine.review || ""); }
      })
      .catch(() => setRatings(MOCK_RATINGS))
      .finally(() => setLoading(false));
  }, [resourceId]); // eslint-disable-line

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!myRating) { toast.warning("Please select a star rating."); return; }
    setSubmitting(true);
    try {
      if (myExisting) {
        await ratingService.updateRating(resourceId, myExisting._id, { value: myRating, review: myReview });
        setRatings(prev => prev.map(r => r._id === myExisting._id ? { ...r, value: myRating, review: myReview } : r));
        toast.success("Rating updated!");
      } else {
        const created = await ratingService.submitRating(resourceId, { value: myRating, review: myReview });
        setRatings(prev => [{ ...created, user: { _id: user?._id, name: user?.name } }, ...prev]);
        toast.success("Thanks for your review!");
      }
    } catch (err) {
      toast.error(err.message || "Failed to submit rating.");
    } finally {
      setSubmitting(false);
    }
  };

  // Distribution
  const dist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: ratings.filter(r => Math.round(r.value) === star).length,
    pct: ratings.length ? Math.round((ratings.filter(r => Math.round(r.value) === star).length / ratings.length) * 100) : 0,
  }));

  return (
    <div className="rating-panel">
      <h3 className="rating-panel-title">Ratings & Reviews</h3>

      {/* Summary */}
      <div className="rating-summary">
        <div className="rating-big-score">
          <span className="rating-avg">{ratings.length ? average.toFixed(1) : "—"}</span>
          <StarRating value={average} readonly size="md" />
          <span className="rating-count">{ratings.length} review{ratings.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="rating-dist">
          {dist.map(d => (
            <div key={d.star} className="rating-dist-row">
              <span className="rating-dist-label">{d.star}★</span>
              <div className="rating-dist-bar">
                <div className="rating-dist-fill" style={{ width: `${d.pct}%` }} />
              </div>
              <span className="rating-dist-count">{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Submit form */}
      {user && (
        <form className="rating-form" onSubmit={handleSubmit}>
          <h4>{myExisting ? "Update your review" : "Write a review"}</h4>
          <StarRating value={myRating} onChange={setMyRating} size="lg" />
          <textarea
            className="input rating-textarea"
            placeholder="Share your thoughts about this resource…"
            value={myReview}
            onChange={e => setMyReview(e.target.value)}
            rows={3}
          />
          <button type="submit" className="btn btn-primary btn-sm" disabled={submitting || !myRating}>
            {submitting ? "Submitting…" : myExisting ? "Update" : "Submit Review"}
          </button>
        </form>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="rating-loading">
          {[1,2].map(i => <div key={i} className="skeleton" style={{ height: 70, borderRadius: 8 }} />)}
        </div>
      ) : (
        <div className="rating-reviews">
          {ratings.map(r => (
            <div key={r._id} className="rating-review-card">
              <div className="rating-review-header">
                <div className="avatar avatar-sm" style={{ background: getAvatarColor(r.user?.name || "") }}>
                  {getInitials(r.user?.name || "?")}
                </div>
                <div>
                  <span className="rating-reviewer">{r.user?.name || "Anonymous"}</span>
                  <StarRating value={r.value} readonly size="sm" />
                </div>
                <span className="rating-review-time">{timeAgo(r.createdAt)}</span>
              </div>
              {r.review && <p className="rating-review-text">{r.review}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Mock fallback
const MOCK_RATINGS = [
  { _id: "r1", value: 5, review: "Excellent resource, very detailed!", user: { _id: "u1", name: "Priya S" }, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { _id: "r2", value: 4, review: "Good content, helped me with assignments.", user: { _id: "u2", name: "Rahul M" }, createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  { _id: "r3", value: 3, review: "Average. Could be more structured.", user: { _id: "u3", name: "Asha K" }, createdAt: new Date(Date.now() - 86400000 * 8).toISOString() },
];