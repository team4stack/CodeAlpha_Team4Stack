# Quiz System Implementation Plan

## Database Schema

### 1. `quizzes` table
- `id` (primary key)
- `video_id` (foreign key to videos)
- `title` (default: "Quiz for [Video Title]")
- `description` (instructions)
- `total_marks` (default: 10)
- `passing_percentage` (default: 80)
- `time_limit_minutes` (default: 10)
- `created_at`
- `updated_at`

### 2. `quiz_questions` table
- `id` (primary key)
- `quiz_id` (foreign key to quizzes)
- `question_text` (text)
- `order_index` (for ordering)
- `marks` (default: 1)
- `created_at`
- `updated_at`

### 3. `quiz_options` table
- `id` (primary key)
- `question_id` (foreign key to quiz_questions)
- `option_text` (text)
- `is_correct` (boolean)
- `order_index` (for ordering)
- `created_at`

### 4. `quiz_attempts` table
- `id` (primary key)
- `quiz_id` (foreign key to quizzes)
- `user_id` (foreign key to users)
- `video_id` (foreign key to videos)
- `score` (marks obtained)
- `total_marks` (total marks)
- `percentage` (calculated)
- `passed` (boolean)
- `started_at` (timestamp)
- `submitted_at` (timestamp)
- `time_taken_seconds` (calculated)
- `created_at`
- `updated_at`

### 5. `quiz_attempt_answers` table
- `id` (primary key)
- `attempt_id` (foreign key to quiz_attempts)
- `question_id` (foreign key to quiz_questions)
- `selected_option_id` (foreign key to quiz_options)
- `is_correct` (boolean)
- `created_at`

## Flow Changes

### Current Flow:
1. User watches video → 90% progress → Next button → Next lecture opens

### New Flow:
1. User watches video → 90% progress → Next button → Quiz page
2. Quiz page → Instructions → Start quiz → 10 min timer → 10 questions
3. Submit quiz → Check score (80% required) → Pass/Fail
4. If Pass (≥80%): Next lecture unlocks
5. If Fail (<80%): Retry option → Watch video again → Retake quiz

## Implementation Steps

### Step 1: Database Schema ✅
- Create migration files for all tables
- Add foreign key constraints
- Add indexes for performance

### Step 2: Backend APIs ✅
- Quiz CRUD (create, get, update, delete)
- Question CRUD
- Option CRUD
- Quiz attempt (start, submit, get results)
- Get quiz by video_id

### Step 3: Admin Panel ✅
- Add "Quiz" tab in video management
- Quiz form (title, description, time limit)
- Question form (add/edit questions)
- Option form (add/edit options with correct answer)
- Quiz preview

### Step 4: Student Portal - Quiz Page ✅
- Quiz instructions component
- Timer component (10 minutes countdown)
- Question display (MCQ format)
- Answer selection
- Submit button
- Results page (pass/fail, score, retry option)

### Step 5: Student Portal - Flow Integration ✅
- Modify Next button to check if quiz exists
- If quiz exists: redirect to quiz page
- If no quiz: direct to next lecture (old behavior)
- Unlock next lecture only after quiz pass

### Step 6: Testing ✅
- Admin: Create quiz, add questions, test
- Student: Watch video, take quiz, pass/fail scenarios
- Edge cases: No quiz, retry logic, timer expiry

## Important Notes

⚠️ **Don't break existing video play mechanism**
- Keep 90% watch requirement
- Keep progress tracking
- Only change Next button behavior

⚠️ **Quiz Requirements**
- 10 questions per quiz
- 10 marks total (1 mark per question)
- 80% passing (8/10 correct)
- 10 minutes time limit
- Retry allowed after watching video again
