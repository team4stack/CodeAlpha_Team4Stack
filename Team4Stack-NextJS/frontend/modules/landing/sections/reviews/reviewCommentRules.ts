/** Fits ~2 lines on the home review card */
export const REVIEW_COMMENT_MAX = 130
export const REVIEW_COMMENT_MIN = 15
export const REVIEW_COMMENT_MIN_WORDS = 4

export function validateReviewComment(comment: string): string | null {
  const trimmed = comment.trim()

  if (!trimmed) {
    return 'Please write your review.'
  }

  if (trimmed.length < REVIEW_COMMENT_MIN) {
    return `Please write at least one full sentence (minimum ${REVIEW_COMMENT_MIN} characters).`
  }

  if (trimmed.length > REVIEW_COMMENT_MAX) {
    return `Review must be ${REVIEW_COMMENT_MAX} characters or less to fit on the card.`
  }

  const words = trimmed.split(/\s+/).filter(Boolean)
  if (words.length < REVIEW_COMMENT_MIN_WORDS) {
    return `Please write at least one sentence with ${REVIEW_COMMENT_MIN_WORDS} or more words.`
  }

  const sentenceParts = trimmed
    .split(/[.!?]+/)
    .map((part) => part.trim())
    .filter(Boolean)

  if (sentenceParts.length > 1) {
    return 'Please write one sentence only — keep it short and clear.'
  }

  return null
}
