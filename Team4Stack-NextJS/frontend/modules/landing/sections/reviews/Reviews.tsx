'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import './Reviews.css'
import {
  REVIEW_COMMENT_MAX,
  validateReviewComment,
} from './reviewCommentRules'

interface Review {
  id: number
  name: string
  address: string
  rating: number
  comment: string
  created_at: string
  status?: 'pending' | 'approved' | 'rejected'
}

const REVIEW_NAME_MIN = 2
const REVIEW_NAME_MAX = 120
const REVIEW_LOCATION_MIN = 2
const REVIEW_LOCATION_MAX = 200
const PER_PAGE = 4

const STAR_FILLED = '#fbbf24'
const STAR_EMPTY = 'rgba(255,255,255,0.18)'

function formatReviewDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function calculateOverallRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0
  const sum = reviews.reduce((acc, review) => acc + Math.min(5, Math.max(0, review.rating || 0)), 0)
  return Math.round((sum / reviews.length) * 10) / 10
}

function getRatingDistribution(reviews: Review[]) {
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  reviews.forEach((review) => {
    const star = Math.min(5, Math.max(1, Math.round(review.rating || 0)))
    counts[star as keyof typeof counts] += 1
  })
  return ([5, 4, 3, 2, 1] as const).map((star) => ({
    star,
    count: counts[star],
    percent: reviews.length ? Math.round((counts[star] / reviews.length) * 100) : 0,
  }))
}

type StarRatingProps = {
  rating: number
  size?: number
  showScore?: boolean
}

function StarIcon({ filled, size = 18 }: { filled: boolean; size?: number }) {
  return (
    <svg
      className="home-reviews__star-icon"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      aria-hidden
    >
      <path
        fill={filled ? STAR_FILLED : STAR_EMPTY}
        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
      />
    </svg>
  )
}

function StarRating({ rating, size = 18, showScore = false }: StarRatingProps) {
  const safeRating = Math.min(5, Math.max(0, rating))
  const scoreLabel =
    Number.isInteger(safeRating) ? `${safeRating}/5` : `${safeRating.toFixed(1)}/5`

  return (
    <div className="home-reviews__stars-wrap">
      <div className="home-reviews__stars" aria-label={`${safeRating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon key={star} filled={safeRating >= star - 0.25} size={size} />
        ))}
      </div>
      {showScore ? <span className="home-reviews__stars-score">{scoreLabel}</span> : null}
    </div>
  )
}

function PanelHighlights() {
  const items = [
    'Share your honest experience with Team4Stack',
    'Keep it to one short, clear sentence',
    'Your feedback helps others choose with confidence',
  ]

  return (
    <ul className="home-reviews__panel-highlights" aria-label="Review highlights">
      {items.map((item) => (
        <li key={item}>
          <span className="home-reviews__panel-highlight-icon" aria-hidden>
            ✓
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function RatingDistribution({ reviews }: { reviews: Review[] }) {
  const rows = getRatingDistribution(reviews)

  return (
    <div className="home-reviews__distribution" aria-label="Rating breakdown">
      {rows.map((row) => (
        <div key={row.star} className="home-reviews__dist-row">
          <span className="home-reviews__dist-label">{row.star} ★</span>
          <div className="home-reviews__dist-track">
            <div
              className="home-reviews__dist-fill"
              style={{ width: `${row.percent}%` }}
            />
          </div>
          <span className="home-reviews__dist-count">{row.count}</span>
        </div>
      ))}
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  const location = review.address?.trim() || 'Location not provided'
  const comment = review.comment?.trim() || 'No comment provided.'
  const dateLabel = formatReviewDate(review.created_at)

  return (
    <article
      className="home-reviews__card"
      itemScope
      itemType="https://schema.org/Review"
    >
      <div className="home-reviews__card-top">
        <div className="home-reviews__card-quote-icon" aria-hidden>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.17 6A5 5 0 0 0 2 11v7h6v-7H5.83A3 3 0 0 1 7.17 6zm10 0A5 5 0 0 0 12 11v7h6v-7h-2.17A3 3 0 0 1 17.17 6z" />
          </svg>
        </div>
        <div
          className="home-reviews__card-rating"
          itemProp="reviewRating"
          itemScope
          itemType="https://schema.org/Rating"
        >
          <meta itemProp="ratingValue" content={String(review.rating)} />
          <meta itemProp="bestRating" content="5" />
          <StarRating rating={review.rating} size={15} showScore />
        </div>
      </div>

      <p className="home-reviews__card-text" itemProp="reviewBody">
        {comment}
      </p>

      <div className="home-reviews__card-divider" aria-hidden />

      <footer className="home-reviews__card-footer">
        <div className="home-reviews__card-user" itemProp="author" itemScope itemType="https://schema.org/Person">
          <div className="home-reviews__avatar" aria-hidden>
            {getInitials(review.name) || '?'}
          </div>
          <div className="home-reviews__card-user-info">
            <h3 className="home-reviews__name" itemProp="name">
              {review.name}
            </h3>
            <p className="home-reviews__meta-line">
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <span itemProp="address">{location}</span>
              {dateLabel ? (
                <>
                  <span className="home-reviews__meta-dot" aria-hidden>
                    ·
                  </span>
                  <time dateTime={review.created_at}>{dateLabel}</time>
                </>
              ) : null}
            </p>
          </div>
        </div>
      </footer>
    </article>
  )
}

const Reviews: React.FC = () => {
  const [allApprovedReviews, setAllApprovedReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const listRef = React.useRef<HTMLDivElement>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newReview, setNewReview] = useState({
    name: '',
    address: '',
    rating: 0,
    comment: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const totalReviews = allApprovedReviews.length
  const overallRating = useMemo(
    () => calculateOverallRating(allApprovedReviews),
    [allApprovedReviews]
  )

  const reviewSchema = useMemo(() => {
    if (allApprovedReviews.length === 0) return null
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Team4Stack',
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: overallRating,
        reviewCount: totalReviews,
        bestRating: 5,
        worstRating: 1,
      },
      review: allApprovedReviews.slice(0, 10).map((review) => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: review.name },
        datePublished: review.created_at,
        reviewBody: review.comment,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: review.rating,
          bestRating: 5,
        },
      })),
    }
  }, [allApprovedReviews, overallRating, totalReviews])

  const totalPages = Math.max(1, Math.ceil(totalReviews / PER_PAGE))

  const displayedReviews = useMemo(() => {
    const from = (page - 1) * PER_PAGE
    return allApprovedReviews.slice(from, from + PER_PAGE)
  }, [allApprovedReviews, page])

  const rangeStart = totalReviews === 0 ? 0 : (page - 1) * PER_PAGE + 1
  const rangeEnd = Math.min(page * PER_PAGE, totalReviews)

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true)
      const { landingApi } = await import('@/lib/api')
      const result = await landingApi.getReviews('approved')

      if (result.error) {
        const errorLower = result.error.toLowerCase()
        if (
          errorLower.includes('429') ||
          errorLower.includes('rate limit') ||
          errorLower.includes('too many requests') ||
          errorLower.includes('too many')
        ) {
          return
        }
        return
      }

      const rows = Array.isArray(result.data) ? result.data : []
      const approved = rows
        .filter((r: Review) => r.status === 'approved')
        .sort(
          (a: Review, b: Review) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ) as Review[]

      setAllApprovedReviews(approved)
    } catch {
      /* keep previous state */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  useEffect(() => {
    if (page === 1) return
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [page])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewReview((prev) => ({ ...prev, [name]: value }))
  }

  const handleRatingSelect = (rating: number) => {
    setNewReview((prev) => ({ ...prev, rating }))
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError('')
    setSubmitSuccess(false)

    try {
      const name = newReview.name.trim()
      const address = newReview.address.trim()
      const comment = newReview.comment.trim()

      if (!name || !address || newReview.rating === 0 || !comment) {
        setSubmitError('Please fill in all required fields.')
        return
      }
      if (name.length < REVIEW_NAME_MIN || name.length > REVIEW_NAME_MAX) {
        setSubmitError(`Name must be between ${REVIEW_NAME_MIN} and ${REVIEW_NAME_MAX} characters.`)
        return
      }
      if (address.length < REVIEW_LOCATION_MIN || address.length > REVIEW_LOCATION_MAX) {
        setSubmitError(
          `Location must be between ${REVIEW_LOCATION_MIN} and ${REVIEW_LOCATION_MAX} characters.`
        )
        return
      }

      const commentError = validateReviewComment(comment)
      if (commentError) {
        setSubmitError(commentError)
        return
      }

      const { landingApi } = await import('@/lib/api')
      const result = await landingApi.createReview({
        name,
        address,
        rating: newReview.rating,
        comment,
        status: 'pending',
      })

      if (result.error) {
        if (
          result.error.includes('429') ||
          result.error.includes('rate limit') ||
          result.error.includes('Too Many Requests')
        ) {
          setSubmitError('Too many requests. Please wait a moment and try again.')
          return
        }
        setSubmitError(result.error)
        return
      }

      setSubmitSuccess(true)
      setNewReview({ name: '', address: '', rating: 0, comment: '' })

      setTimeout(() => {
        setShowReviewForm(false)
        setSubmitSuccess(false)
        fetchReviews()
      }, 2000)
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to submit review. Please try again.'
      setSubmitError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="reviews" className="home-reviews">
      {reviewSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
        />
      ) : null}

      <div className="home-reviews__backdrop" aria-hidden>
        <div className="home-reviews__mesh" />
        <div className="home-reviews__glow home-reviews__glow--left" />
        <div className="home-reviews__glow home-reviews__glow--right" />
        <div className="home-reviews__grid-bg" />
      </div>

      <div className="container-custom relative z-10 px-4">
        <header className="home-reviews__header">
          <span className="home-reviews__badge">Testimonials</span>
          <h2 className="home-reviews__title">
            User <span className="home-reviews__title-accent">Reviews</span>
          </h2>
          <p className="home-reviews__subtitle">
            Real feedback from developers and learners who use our tools and resources
          </p>
          <div className="home-reviews__divider" aria-hidden />
        </header>

        {loading ? (
          <div className="home-reviews__loading">
            <div className="home-reviews__spinner" aria-hidden />
            <p>Loading reviews...</p>
          </div>
        ) : (
          <div className="home-reviews__layout">
            <aside className="home-reviews__panel">
              <div className="home-reviews__panel-body">
                {totalReviews > 0 ? (
                  <>
                    <div className="home-reviews__panel-score">
                      <span className="home-reviews__panel-number">{overallRating.toFixed(1)}</span>
                      <span className="home-reviews__panel-outof">/ 5</span>
                    </div>
                    <div className="home-reviews__panel-stars">
                      <StarRating rating={overallRating} size={22} />
                    </div>
                    <p className="home-reviews__panel-meta">
                      Based on <strong>{totalReviews}</strong> verified review
                      {totalReviews === 1 ? '' : 's'}
                    </p>
                    <RatingDistribution reviews={allApprovedReviews} />
                    <PanelHighlights />
                  </>
                ) : (
                  <div className="home-reviews__empty-panel">
                    <p className="home-reviews__empty">No reviews yet.</p>
                    <PanelHighlights />
                  </div>
                )}
              </div>
              <button
                type="button"
                className="home-reviews__panel-cta"
                onClick={() => setShowReviewForm(true)}
              >
                Write a Review
              </button>
            </aside>

            <div className="home-reviews__list" ref={listRef}>
              <div className="home-reviews__list-head">
                <h3 className="home-reviews__list-title">Latest Reviews</h3>
                <p className="home-reviews__list-count">
                  {rangeStart}–{rangeEnd} of {totalReviews}
                </p>
              </div>

              {displayedReviews.length === 0 ? (
                <p className="home-reviews__empty">
                  Be the first to share your experience with Team4Stack.
                </p>
              ) : (
                <div key={`page-${page}`} className="home-reviews__cards home-reviews__cards--grid">
                  {displayedReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              )}

              {totalPages > 1 ? (
                <div className="home-reviews__list-actions">
                  <nav className="home-reviews__pagination" aria-label="Reviews pagination">
                    <button
                      type="button"
                      className="home-reviews__page-btn"
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      aria-label="Previous page"
                    >
                      ←
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={`home-reviews__page-btn${p === page ? ' home-reviews__page-btn--active' : ''}`}
                        onClick={() => setPage(p)}
                        aria-label={`Page ${p}`}
                        aria-current={p === page ? 'page' : undefined}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="home-reviews__page-btn"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      aria-label="Next page"
                    >
                      →
                    </button>
                  </nav>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {showReviewForm ? (
        <div
          className="home-reviews__modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-modal-title"
        >
          <div className="home-reviews__modal">
            <div className="home-reviews__modal-head">
              <h3 id="review-modal-title" className="home-reviews__modal-title">
                Write a Review
              </h3>
              <button
                type="button"
                className="home-reviews__modal-close"
                onClick={() => setShowReviewForm(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {submitSuccess ? (
              <div className="home-reviews__success">
                <div className="home-reviews__success-icon" aria-hidden>
                  ✓
                </div>
                <p>Review submitted! Awaiting admin approval.</p>
                <small>It will appear on the site after approval.</small>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview}>
                <div className="home-reviews__field">
                  <label htmlFor="name" className="home-reviews__label">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newReview.name}
                    onChange={handleInputChange}
                    maxLength={REVIEW_NAME_MAX}
                    className="home-reviews__input"
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className="home-reviews__field">
                  <label htmlFor="address" className="home-reviews__label">
                    City / Location *
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={newReview.address}
                    onChange={handleInputChange}
                    maxLength={REVIEW_LOCATION_MAX}
                    className="home-reviews__input"
                    placeholder="e.g. London, UK"
                    required
                  />
                </div>

                <div className="home-reviews__field">
                  <label className="home-reviews__label">Your Rating *</label>
                  <div className="home-reviews__rating-picker">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="home-reviews__rating-btn"
                        onClick={() => handleRatingSelect(star)}
                        aria-label={`Rate ${star} stars`}
                      >
                        <StarIcon filled={star <= newReview.rating} size={32} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="home-reviews__field">
                  <div className="home-reviews__label-row">
                    <label htmlFor="comment" className="home-reviews__label">
                      Your Review *
                    </label>
                    <span
                      className={`home-reviews__char-count${
                        newReview.comment.length >= REVIEW_COMMENT_MAX
                          ? ' home-reviews__char-count--limit'
                          : ''
                      }`}
                      aria-live="polite"
                    >
                      {newReview.comment.length}/{REVIEW_COMMENT_MAX}
                    </span>
                  </div>
                  <textarea
                    id="comment"
                    name="comment"
                    value={newReview.comment}
                    onChange={handleInputChange}
                    rows={3}
                    maxLength={REVIEW_COMMENT_MAX}
                    className="home-reviews__textarea"
                    placeholder="One short sentence about your experience..."
                    required
                  />
                  <p className="home-reviews__field-hint">
                    One sentence only, {REVIEW_COMMENT_MAX} characters max — it appears on the review
                    card.
                  </p>
                </div>

                {submitError ? <div className="home-reviews__error">{submitError}</div> : null}

                <div className="home-reviews__modal-actions">
                  <button
                    type="button"
                    className="home-reviews__btn-secondary"
                    onClick={() => setShowReviewForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="home-reviews__btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default Reviews
