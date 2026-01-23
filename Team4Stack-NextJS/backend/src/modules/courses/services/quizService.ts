import { supabaseAdmin } from '../../../config/supabase';
import { Quiz, QuizQuestion, QuizOption, QuizAttempt, QuizAttemptAnswer } from '../types';

export class QuizService {
  // Get quiz by video ID
  async getQuizByVideoId(videoId: number): Promise<Quiz | null> {
    const { data, error } = await supabaseAdmin
      .from('quizzes')
      .select('*')
      .eq('video_id', videoId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
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
      const videoId = typeof quiz.video_id === 'string' ? parseInt(quiz.video_id) : quiz.video_id;
      
      if (!videoId || isNaN(videoId)) {
        throw new Error('Invalid video_id: must be a valid number');
      }
      
      // Check if quiz already exists for this video
      const existingQuiz = await this.getQuizByVideoId(videoId);
      if (existingQuiz) {
        throw new Error(`Quiz already exists for video ID ${videoId}. Use update instead.`);
      }
      
      const quizData: any = {
        video_id: videoId,
        title: quiz.title || 'Quiz',
        description: quiz.description || null,
        total_marks: quiz.total_marks || 10,
        passing_percentage: quiz.passing_percentage || 80,
        time_limit_minutes: quiz.time_limit_minutes || 10
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
    const { data, error } = await supabaseAdmin
      .from('quizzes')
      .update(quiz)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
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
    const { data, error } = await supabaseAdmin
      .from('quiz_questions')
      .insert(question)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update question
  async updateQuestion(id: number | string, question: Partial<QuizQuestion>): Promise<QuizQuestion> {
    const { data, error } = await supabaseAdmin
      .from('quiz_questions')
      .update(question)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
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
    const { data, error } = await supabaseAdmin
      .from('quiz_options')
      .insert(option)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update option
  async updateOption(id: number | string, option: Partial<QuizOption>): Promise<QuizOption> {
    const { data, error } = await supabaseAdmin
      .from('quiz_options')
      .update(option)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
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
      .single();

    if (attemptError) throw attemptError;

    const quiz = attempt.quizzes as Quiz;

    // Get correct answers for all questions
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from('quiz_questions')
      .select('id, marks')
      .eq('quiz_id', quiz.id);

    if (questionsError) throw questionsError;

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
    const { data: updatedAttempt, error: updateError } = await supabaseAdmin
      .from('quiz_attempts')
      .update({
        score: totalScore,
        total_marks: quiz.total_marks,
        percentage: percentage,
        passed: passed,
        submitted_at: submittedAt.toISOString(),
        time_taken_seconds: timeTakenSeconds
      })
      .eq('id', attemptId)
      .select()
      .single();

    if (updateError) throw updateError;

    return updatedAttempt;
  }

  // Get user's quiz attempts for a video
  async getUserQuizAttempts(videoId: number, userId: string): Promise<QuizAttempt[]> {
    const { data, error } = await supabaseAdmin
      .from('quiz_attempts')
      .select('*')
      .eq('video_id', videoId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Check if user has passed quiz for video
  async hasUserPassedQuiz(videoId: number, userId: string): Promise<boolean> {
    const attempts = await this.getUserQuizAttempts(videoId, userId);
    return attempts.some(attempt => attempt.passed === true);
  }
}

export default new QuizService();
