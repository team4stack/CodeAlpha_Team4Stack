export const REVIEW_COMMENT_MAX = 130
export const REVIEW_COMMENT_MIN = 15
export const REVIEW_COMMENT_MIN_WORDS = 4

export function validateReviewComment(comment: string): string | null {
  const trimmed = comment.trim()

  if (!trimmed) {
    return 'Review text is required'
  }

  if (trimmed.length < REVIEW_COMMENT_MIN) {
    return `Review text must be at least ${REVIEW_COMMENT_MIN} characters`
  }

  if (trimmed.length > REVIEW_COMMENT_MAX) {
    return `Review text must be at most ${REVIEW_COMMENT_MAX} characters`
  }

  const words = trimmed.split(/\s+/).filter(Boolean)
  if (words.length < REVIEW_COMMENT_MIN_WORDS) {
    return `Review must contain at least ${REVIEW_COMMENT_MIN_WORDS} words in one sentence`
  }

  const sentenceParts = trimmed
    .split(/[.!?]+/)
    .map((part) => part.trim())
    .filter(Boolean)

  if (sentenceParts.length > 1) {
    return 'Review must be a single sentence'
  }

  return null
}
