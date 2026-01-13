'use client'

import React, { useState, useEffect, useCallback } from 'react';

// Define the review type
interface Review {
  id: number;
  name: string;
  address: string;
  rating: number;
  comment: string;
  created_at: string;
  status?: 'pending' | 'approved' | 'rejected';
}

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalReviews, setTotalReviews] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 6;
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    name: '',
    address: '',
    rating: 0,
    comment: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Load reviews via API
  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch reviews via API
      const { landingApi } = await import('@/lib/api')
      const result = await landingApi.getReviews('approved')
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      // Get total count and paginated reviews
      const allReviews = result.data || []
      const approvedReviews = allReviews.filter((r: any) => r.status === 'approved')
      setTotalReviews(approvedReviews.length)
      
      // Client-side pagination
      const limit = showAll ? perPage : 3
      const from = showAll ? (page - 1) * perPage : 0
      const to = showAll ? (page * perPage) : limit
      const paginatedReviews = approvedReviews
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(from, to)
      
      setReviews(paginatedReviews)
    } catch (error) {
      // Error handled silently - user sees loading state
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading reviews:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [showAll, page]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // Handle input changes for the review form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewReview(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle rating selection
  const handleRatingSelect = (rating: number) => {
    setNewReview(prev => ({
      ...prev,
      rating
    }));
  };

  // Submit the review form
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      // Validate required fields
      if (!newReview.name || !newReview.address || newReview.rating === 0 || !newReview.comment) {
        throw new Error('Please fill in all required fields');
      }

      // Insert the new review into Supabase
      const { data, error } = await supabase
        .from('reviews')
        .insert([
          {
            name: newReview.name,
            address: newReview.address,
            rating: newReview.rating,
            comment: newReview.comment,
            status: 'pending'
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      setSubmitSuccess(true);
      
      // Reset form
      setNewReview({
        name: '',
        address: '',
        rating: 0,
        comment: ''
      });
      
      // Close the form after a short delay
      setTimeout(() => {
        setShowReviewForm(false);
        setSubmitSuccess(false);
        // Reload reviews to show the new one
        loadReviews();
      }, 2000);
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error submitting review:', error);
      }
      setSubmitError(error.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Render star rating (memoized)
  const renderStars = useCallback((rating: number) => {
    return (
      <div className="star-rating flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span 
            key={star} 
            className={`star text-sm ${star <= rating ? 'filled' : 'empty'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  }, []);

  // Render star rating for selection
  const renderStarRatingSelector = () => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`text-2xl ${star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'} focus:outline-none`}
            onClick={() => handleRatingSelect(star)}
            aria-label={`Rate ${star} stars`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <section id="reviews" className="py-16">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 gradient-text">User Reviews</h2>
          <p className="text-lg max-w-2xl mx-auto">
            See what our users are saying about our tools and resources
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-green-400 mx-auto rounded-full mt-4"></div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            <p className="mt-2 text-gray-400">Loading reviews...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center items-center mb-6">
              <div>
                Showing {reviews.length} of {totalReviews} reviews
              </div>
            </div>
            
            {reviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No reviews yet. Be the first to share your experience!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reviews.map((review) => (
                  <div 
                    key={review.id} 
                    className="card p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-sm">{review.name}</h3>
                        <p className="text-xs opacity-75">{review.address}</p>
                      </div>
                      <div className="text-xs opacity-60">
                        {new Date(review.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="mb-2">
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-sm line-clamp-3">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
            
            <div className="text-center mt-8">
              {totalReviews > 3 && !showAll && (
                <div className="flex items-center justify-center mb-3">
                  <button
                    onClick={() => setShowAll(true)}
                    className="reviews-dot"
                    aria-label="Show more reviews"
                    title="Show more reviews"
                  >
                    ↓
                  </button>
                </div>
              )}
              {showAll && (
                <div className="reviews-pagination">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="reviews-dot"
                  >
                    ◄
                  </button>
                  {Array.from({ length: Math.max(1, Math.ceil(totalReviews / perPage)) }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`reviews-dot ${p === page ? 'reviews-dot--active' : ''}`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(Math.ceil(totalReviews / perPage) || 1, p + 1))}
                    disabled={page >= (Math.ceil(totalReviews / perPage) || 1)}
                    className="reviews-dot"
                  >
                    ►
                  </button>
                </div>
              )}
              <button 
                onClick={() => setShowReviewForm(true)}
                className="px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all mt-4"
              >
                Write Review
              </button>
            </div>
          </>
        )}
      </div>

      {/* Review Form Popup */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto overscroll-contain">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md my-8 sm:my-12 mx-auto relative transform transition-all duration-300 ease-in-out animate-scale-in">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Write a Review</h3>
                <button 
                  onClick={() => setShowReviewForm(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {submitSuccess ? (
                <div className="text-center py-6">
                  <div className="text-green-500 text-3xl mb-3">✓</div>
                  <p className="text-green-600 dark:text-green-400 text-lg">Review submitted! Awaiting admin approval.</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">It will appear on the site after approval.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview}>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={newReview.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Your Address *
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={newReview.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                      placeholder="Enter your city, country"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Rating * <span className="text-red-500">(Required)</span>
                    </label>
                    <div className="flex justify-center space-x-1 my-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`text-3xl sm:text-4xl ${star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'} focus:outline-none transition-all duration-200 hover:scale-110`}
                          onClick={() => handleRatingSelect(star)}
                          aria-label={`Rate ${star} stars`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    {newReview.rating > 0 && (
                      <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-1">
                        {newReview.rating} star{newReview.rating !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Your Review *
                    </label>
                    <textarea
                      id="comment"
                      name="comment"
                      value={newReview.comment}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-all duration-200 resize-none"
                      placeholder="Share your experience with our tools and resources..."
                      required
                    ></textarea>
                  </div>
                  
                  {submitError && (
                    <div className="mb-4 text-red-600 dark:text-red-400 text-sm p-2 rounded bg-red-50 dark:bg-red-900/20">
                      {submitError}
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="px-4 py-2 sm:px-6 sm:py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 w-full sm:w-auto"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 shadow-lg transition-all duration-200 w-full sm:w-auto"
                    >
                      {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Reviews;
