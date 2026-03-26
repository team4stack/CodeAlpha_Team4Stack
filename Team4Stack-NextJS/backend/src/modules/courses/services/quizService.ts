import { supabaseAdmin } from '../../../config/supabase';
import {
  pickAllowedKeys,
  updateByIdWithTimestampRetry,
  notFoundError,
  shouldRetryUpdateWithoutUpdatedAt
} from '../../../shared/utils/supabaseAdminWrite';
import { Quiz, QuizQuestion, QuizOption, QuizAttempt, QuizAttemptAnswer } from '../types';

const QUIZ_UPDATE_KEYS = [
  'video_id',
  'title',
  'description',
  'total_marks',
  'passing_percentage',
  'time_limit_minutes'
] as const;
const QUESTION_KEYS = ['quiz_id', 'question_text', 'order_index', 'marks'] as const;
const OPTION_KEYS = ['question_id', 'option_text', 'is_correct', 'order_index'] as const;

const toIntegerOrUndefined = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'number' && typeof value !== 'string') return undefined;
  const parsed = typeof value === 'number' ? Math.trunc(value) : Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return undefined;
  return parsed;
};

export class QuizService {
  async getQuizByVideoId(videoId: number): Promise<Quiz | null> {
    const { data, error } = await supabaseAdmin.from('quizzes').select('*').eq('video_id', videoId).maybeSingle();

    if (error) throw error;
    return data;
  }

  // Get quiz with questions and options
  async getQuizWithDetails(videoId: number): Promise<any> {
    const quiz = await this.getQuizByVideoId(videoId);
    if (!quiz) return null;

    // Get questions
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quiz.id)
      .order('order_index', { ascending: true });

    if (questionsError) throw questionsError;

    // Get options for each question
    const questionsWithOptions = await Promise.all(
      (questions || []).map(async (question) => {
        const { data: options, error: optionsError } = await supabaseAdmin
          .from('quiz_options')
          .select('*')
          .eq('question_id', question.id)
          .order('order_index', { ascending: true });

        if (optionsError) throw optionsError;

        return {
          ...question,
          options: options || []
        };
      })
    );

    return {
      ...quiz,
      questions: questionsWithOptions
    };
  }

  // Create quiz
  async createQuiz(quiz: Partial<Quiz>): Promise<Quiz> {
    console.log('[QuizService] Creating quiz:', JSON.stringify(quiz, null, 2));
    
    try {
      // Ensure video_id is integer
      const videoId =
        typeof quiz.video_id === 'string' ? Number.parseInt(quiz.video_id, 10) : quiz.video_id;
      
      if (!videoId || Number.isNaN(videoId)) {
        throw new Error('Invalid video_id: must be a valid number');
      }
      
      // Check if quiz already exists for this video
      const existingQuiz = await this.getQuizByVideoId(videoId);
      if (existingQuiz) {
        throw new Error(`Quiz already exists for video ID ${videoId}. Use update instead.`);
      }
      
      const totalMarks = toIntegerOrUndefined(quiz.total_marks) ?? 10;
      const passingPercentage = toIntegerOrUndefined(quiz.passing_percentage) ?? 80;
      const timeLimitMinutes = toIntegerOrUndefined(quiz.time_limit_minutes) ?? 10;

      if (totalMarks < 1) {
        throw new Error('total_marks must be at least 1');
      }
      if (passingPercentage < 1 || passingPercentage > 100) {
        throw new Error('passing_percentage must be between 1 and 100');
      }
      if (timeLimitMinutes < 1 || timeLimitMinutes > 180) {
        throw new Error('time_limit_minutes must be between 1 and 180');
      }

      const quizData: Record<string, unknown> = {
        video_id: videoId,
        title: quiz.title || 'Quiz',
        description: quiz.description || null,
        total_marks: totalMarks,
        passing_percentage: passingPercentage,
        time_limit_minutes: timeLimitMinutes
      };
      
      // Remove undefined and null values for optional fields
      if (quizData.description === null || quizData.description === undefined) {
        delete quizData.description;
      }
      
      console.log('[QuizService] Prepared quiz data:', JSON.stringify(quizData, null, 2));
      
      const { data, error } = await supabaseAdmin
        .from('quizzes')
        .insert(quizData)
        .select()
        .single();

      if (error) {
        console.error('[QuizService] Supabase error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        
        // Provide more user-friendly error messages
        if (error.code === '23505') { // Unique violation
          throw new Error(`Quiz already exists for this video. Please update the existing quiz instead.`);
        } else if (error.code === '23503') { // Foreign key violation
          throw new Error(`Invalid video_id: Video with ID ${videoId} does not exist.`);
        } else if (error.code === '23502') { // Not null violation
          throw new Error(`Missing required field: ${error.hint || 'Check all required fields are provided'}`);
        }
        
        throw error;
      }
      
      console.log('[QuizService] Quiz created successfully:', data);
      return data;
    } catch (err: any) {
      console.error('[QuizService] Exception in createQuiz:', err);
      throw err;
    }
  }

  // Update quiz
  async updateQuiz(id: number | string, quiz: Partial<Quiz>): Promise<Quiz> {
    const patch = pickAllowedKeys(quiz, QUIZ_UPDATE_KEYS);

    const parsedTotalMarks = toIntegerOrUndefined(patch.total_marks);
    if (parsedTotalMarks !== undefined) {
      if (parsedTotalMarks < 1) throw new Error('total_marks must be at least 1');
      patch.total_marks = parsedTotalMarks;
    }

    const parsedPassingPercentage = toIntegerOrUndefined(patch.passing_percentage);
    if (parsedPassingPercentage !== undefined) {
      if (parsedPassingPercentage < 1 || parsedPassingPercentage > 100) {
        throw new Error('passing_percentage must be between 1 and 100');
      }
      patch.passing_percentage = parsedPassingPercentage;
    }

    const parsedTimeLimit = toIntegerOrUndefined(patch.time_limit_minutes);
    if (parsedTimeLimit !== undefined) {
      if (parsedTimeLimit < 1 || parsedTimeLimit > 180) {
        throw new Error('time_limit_minutes must be between 1 and 180');
      }
      patch.time_limit_minutes = parsedTimeLimit;
    }

    const row = await updateByIdWithTimestampRetry('quizzes', id, patch, { notFoundMessage: 'Quiz not found' });
    return row as unknown as Quiz;
  }

  // Delete quiz
  async deleteQuiz(id: number | string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('quizzes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Create question
  async createQuestion(question: Partial<QuizQuestion>): Promise<QuizQuestion> {
    const insert = pickAllowedKeys(question, QUESTION_KEYS);
    const { data, error } = await supabaseAdmin.from('quiz_questions').insert(insert).select().single();

    if (error) throw error;
    return data;
  }

  // Update question
  async updateQuestion(id: number | string, question: Partial<QuizQuestion>): Promise<QuizQuestion> {
    const patch = pickAllowedKeys(question, QUESTION_KEYS);
    const row = await updateByIdWithTimestampRetry('quiz_questions', id, patch, {
      notFoundMessage: 'Quiz question not found'
    });
    return row as unknown as QuizQuestion;
  }

  // Delete question
  async deleteQuestion(id: number | string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('quiz_questions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Create option
  async createOption(option: Partial<QuizOption>): Promise<QuizOption> {
    const insert = pickAllowedKeys(option, OPTION_KEYS);
    const { data, error } = await supabaseAdmin.from('quiz_options').insert(insert).select().single();

    if (error) throw error;
    return data;
  }

  // Update option
  async updateOption(id: number | string, option: Partial<QuizOption>): Promise<QuizOption> {
    const patch = pickAllowedKeys(option, OPTION_KEYS);
    const row = await updateByIdWithTimestampRetry('quiz_options', id, patch, {
      notFoundMessage: 'Quiz option not found'
    });
    return row as unknown as QuizOption;
  }

  // Delete option
  async deleteOption(id: number | string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('quiz_options')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Start quiz attempt
  async startQuizAttempt(attempt: Partial<QuizAttempt>): Promise<QuizAttempt> {
    console.log('[QuizService] Starting quiz attempt with data:', JSON.stringify(attempt, null, 2));
    
    try {
      const attemptData: any = {
        quiz_id: attempt.quiz_id,
        user_id: attempt.user_id,
        video_id: attempt.video_id,
        score: attempt.score || 0,
        total_marks: attempt.total_marks || 10,
        percentage: attempt.percentage || 0,
        passed: attempt.passed || false,
        started_at: new Date().toISOString()
      };
      
      console.log('[QuizService] Prepared attempt data:', JSON.stringify(attemptData, null, 2));
      
      const { data, error } = await supabaseAdmin
        .from('quiz_attempts')
        .insert(attemptData)
        .select()
        .single();

      if (error) {
        console.error('[QuizService] Supabase error inserting quiz attempt:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      console.log('[QuizService] Quiz attempt created successfully:', data);
      return data;
    } catch (err: any) {
      console.error('[QuizService] Exception in startQuizAttempt:', err);
      throw err;
    }
  }

  // Submit quiz attempt
  async submitQuizAttempt(
    attemptId: number | string,
    answers: Array<{ question_id: number | string; selected_option_id: number | string }>
  ): Promise<QuizAttempt> {
    // Get quiz details
    const { data: attempt, error: attemptError } = await supabaseAdmin
      .from('quiz_attempts')
      .select('*, quizzes(*)')
      .eq('id', attemptId)
      .maybeSingle();

    if (attemptError) throw attemptError;
    if (!attempt) throw notFoundError('Quiz attempt not found');

    const quiz = attempt.quizzes as Quiz;

    let totalScore = 0;
    const attemptAnswers: Partial<QuizAttemptAnswer>[] = [];

    // Get all questions and options with their IDs to ensure type consistency
    const { data: allQuestions, error: allQuestionsError } = await supabaseAdmin
      .from('quiz_questions')
      .select('id, marks')
      .eq('quiz_id', quiz.id);

    if (allQuestionsError) throw allQuestionsError;

    // Check each answer
    for (const answer of answers) {
      // Convert answer IDs to strings for comparison
      const answerQuestionId = String(answer.question_id);
      const answerOptionId = String(answer.selected_option_id);
      
      // Find the actual question from database (handles UUID/INTEGER)
      const question = allQuestions.find((q: any) => {
        const qId = String(q.id);
        return qId === answerQuestionId;
      });

      if (!question) {
        console.warn(`[QuizService] Question not found: ${answer.question_id} (looking in: ${allQuestions.map((q: any) => String(q.id)).join(', ')})`);
        continue;
      }

      // Get all options for this question to find the correct one
      const { data: allOptions, error: optionsError } = await supabaseAdmin
        .from('quiz_options')
        .select('id, is_correct')
        .eq('question_id', question.id);

      if (optionsError) {
        console.error(`[QuizService] Error fetching options for question ${question.id}:`, optionsError);
        throw optionsError;
      }

      // Find the selected option (handle both UUID and INTEGER)
      const option = allOptions?.find((opt: any) => {
        const optId = String(opt.id);
        return optId === answerOptionId;
      });

      if (!option) {
        console.warn(`[QuizService] Option not found: ${answer.selected_option_id} for question ${question.id}`);
        continue;
      }

      const isCorrect = option.is_correct;
      const marks = isCorrect ? (question.marks || 1) : 0;

      totalScore += marks;

      // Use actual database IDs (which are in correct format - UUID or INTEGER)
      attemptAnswers.push({
        attempt_id: attemptId,
        question_id: question.id, // Use database ID (correct type)
        selected_option_id: option.id, // Use database ID (correct type)
        is_correct: isCorrect
      });
    }

    // Calculate percentage
    const percentage = (totalScore / quiz.total_marks) * 100;
    const passed = percentage >= quiz.passing_percentage;

    // Calculate time taken
    const startedAt = new Date(attempt.started_at);
    const submittedAt = new Date();
    const timeTakenSeconds = Math.floor((submittedAt.getTime() - startedAt.getTime()) / 1000);

    // Insert answers
    if (attemptAnswers.length > 0) {
      const { error: answersError } = await supabaseAdmin
        .from('quiz_attempt_answers')
        .insert(attemptAnswers);

      if (answersError) throw answersError;
    }

    // Update attempt
    const stamp = submittedAt.toISOString();
    const updatePayload = {
      score: totalScore,
      total_marks: quiz.total_marks,
      percentage: percentage,
      passed: passed,
      submitted_at: stamp,
      time_taken_seconds: timeTakenSeconds,
      updated_at: stamp
    };
    let { data: updatedAttempt, error: updateError } = await supabaseAdmin
      .from('quiz_attempts')
      .update(updatePayload)
      .eq('id', attemptId)
      .select()
      .maybeSingle();

    if (updateError && shouldRetryUpdateWithoutUpdatedAt(updateError)) {
      const { score, total_marks, percentage, passed, submitted_at, time_taken_seconds } = updatePayload;
      ({ data: updatedAttempt, error: updateError } = await supabaseAdmin
        .from('quiz_attempts')
        .update({ score, total_marks, percentage, passed, submitted_at, time_taken_seconds })
        .eq('id', attemptId)
        .select()
        .maybeSingle());
    }

    if (updateError) throw updateError;
    if (!updatedAttempt) throw notFoundError('Quiz attempt not found');

    return updatedAttempt;
  }

  // Get user's quiz attempts for a video
  async getUserQuizAttempts(videoId: number, userId: string): Promise<QuizAttempt[]> {
    const quiz = await this.getQuizByVideoId(videoId);
    const { data: videoRow, error: videoError } = await supabaseAdmin
      .from('videos')
      .select('updated_at, created_at')
      .eq('id', videoId)
      .maybeSingle();
    if (videoError) throw videoError;

    const quizUpdatedAtRaw =
      (quiz as unknown as { updated_at?: string | null; created_at?: string | null } | null)?.updated_at ||
      (quiz as unknown as { created_at?: string | null } | null)?.created_at;
    const videoUpdatedAtRaw =
      (videoRow as { updated_at?: string | null; created_at?: string | null } | null)?.updated_at ||
      (videoRow as { created_at?: string | null } | null)?.created_at;

    const quizUpdatedAt = quizUpdatedAtRaw ? Date.parse(String(quizUpdatedAtRaw)) : 0;
    const videoUpdatedAt = videoUpdatedAtRaw ? Date.parse(String(videoUpdatedAtRaw)) : 0;
    const contentUpdatedAt = Math.max(
      Number.isNaN(quizUpdatedAt) ? 0 : quizUpdatedAt,
      Number.isNaN(videoUpdatedAt) ? 0 : videoUpdatedAt
    );

    const { data, error } = await supabaseAdmin
      .from('quiz_attempts')
      .select('*')
      .eq('video_id', videoId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    const attempts = (data || []) as QuizAttempt[];
    if (contentUpdatedAt <= 0) return attempts;

    return attempts.filter((attempt) => {
      const attemptAtRaw =
        (attempt as unknown as { submitted_at?: string | null; created_at?: string | null }).submitted_at ||
        (attempt as unknown as { created_at?: string | null }).created_at;
      if (!attemptAtRaw) return false;
      const attemptAt = Date.parse(String(attemptAtRaw));
      if (Number.isNaN(attemptAt)) return false;
      return attemptAt >= contentUpdatedAt;
    });
  }

  // Check if user has passed quiz for video
  async hasUserPassedQuiz(videoId: number, userId: string): Promise<boolean> {
    const quiz = await this.getQuizByVideoId(videoId);
    if (!quiz) return false;

    const { data: latestPassedAttempt, error: attemptError } = await supabaseAdmin
      .from('quiz_attempts')
      .select('passed, submitted_at, created_at')
      .eq('video_id', videoId)
      .eq('user_id', userId)
      .eq('passed', true)
      .order('submitted_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (attemptError) throw attemptError;
    if (!latestPassedAttempt) return false;

    const { data: videoRow, error: videoError } = await supabaseAdmin
      .from('videos')
      .select('updated_at, created_at')
      .eq('id', videoId)
      .maybeSingle();
    if (videoError) throw videoError;

    const quizUpdatedAtRaw = (quiz as unknown as { updated_at?: string | null; created_at?: string | null }).updated_at
      || (quiz as unknown as { created_at?: string | null }).created_at;
    const videoUpdatedAtRaw =
      (videoRow as { updated_at?: string | null; created_at?: string | null } | null)?.updated_at ||
      (videoRow as { created_at?: string | null } | null)?.created_at;
    const attemptAtRaw =
      (latestPassedAttempt as { submitted_at?: string | null; created_at?: string | null }).submitted_at ||
      (latestPassedAttempt as { created_at?: string | null }).created_at;

    const quizUpdatedAt = quizUpdatedAtRaw ? Date.parse(String(quizUpdatedAtRaw)) : 0;
    const videoUpdatedAt = videoUpdatedAtRaw ? Date.parse(String(videoUpdatedAtRaw)) : 0;
    const attemptAt = attemptAtRaw ? Date.parse(String(attemptAtRaw)) : 0;
    const contentUpdatedAt = Math.max(
      Number.isNaN(quizUpdatedAt) ? 0 : quizUpdatedAt,
      Number.isNaN(videoUpdatedAt) ? 0 : videoUpdatedAt
    );

    if (Number.isNaN(attemptAt) || attemptAt <= 0) return false;
    return attemptAt >= contentUpdatedAt;
  }

  async getAttemptOwnerUserId(attemptId: number | string): Promise<string | null> {
    const { data, error } = await supabaseAdmin
      .from('quiz_attempts')
      .select('user_id')
      .eq('id', attemptId)
      .maybeSingle();
    if (error) throw error;
    if (!data || (data as { user_id?: unknown }).user_id == null) return null;
    return String((data as { user_id: unknown }).user_id);
  }
}

export default new QuizService();
