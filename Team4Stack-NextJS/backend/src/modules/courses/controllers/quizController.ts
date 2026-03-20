import { Request, Response, NextFunction } from 'express';
import { badRequestError } from '../../../shared/utils/supabaseAdminWrite';
import quizService from '../services/quizService';

export class QuizController {
  // Get quiz by video ID
  getQuizByVideoId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { videoId } = req.params;
      const quiz = await quizService.getQuizWithDetails(parseInt(videoId));
      res.json({ success: true, data: quiz });
    } catch (error: any) {
      next(error);
    }
  };

  // Create quiz
  createQuiz = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('[QuizController] Creating quiz with data:', JSON.stringify(req.body, null, 2));
      const quiz = await quizService.createQuiz(req.body);
      res.status(201).json({ success: true, data: quiz });
    } catch (error: any) {
      console.error('[QuizController] Error creating quiz:', error);
      console.error('[QuizController] Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      next(error);
    }
  };

  // Helper function to parse ID (handles both UUID and INTEGER)
  private parseId(id: string): number | string {
    // Check if it's a UUID (contains hyphens)
    if (id.includes('-')) {
      return id; // Return as string for UUID
    }
    // Try to parse as integer
    const parsed = parseInt(id, 10);
    if (isNaN(parsed)) {
      throw badRequestError(`Invalid ID format: ${id}`);
    }
    return parsed;
  }

  // Update quiz
  updateQuiz = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const quizId = this.parseId(id);
      const quiz = await quizService.updateQuiz(quizId, req.body);
      res.json({ success: true, data: quiz });
    } catch (error: any) {
      next(error);
    }
  };

  // Delete quiz
  deleteQuiz = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const quizId = this.parseId(id);
      await quizService.deleteQuiz(quizId);
      res.json({ success: true, message: 'Quiz deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  };

  // Create question
  createQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const question = await quizService.createQuestion(req.body);
      res.status(201).json({ success: true, data: question });
    } catch (error: any) {
      next(error);
    }
  };

  // Update question
  updateQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const questionId = this.parseId(id);
      const question = await quizService.updateQuestion(questionId, req.body);
      res.json({ success: true, data: question });
    } catch (error: any) {
      next(error);
    }
  };

  // Delete question
  deleteQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const questionId = this.parseId(id);
      await quizService.deleteQuestion(questionId);
      res.json({ success: true, message: 'Question deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  };

  // Create option
  createOption = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const option = await quizService.createOption(req.body);
      res.status(201).json({ success: true, data: option });
    } catch (error: any) {
      next(error);
    }
  };

  // Update option
  updateOption = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const optionId = this.parseId(id);
      const option = await quizService.updateOption(optionId, req.body);
      res.json({ success: true, data: option });
    } catch (error: any) {
      next(error);
    }
  };

  // Delete option
  deleteOption = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const optionId = this.parseId(id);
      await quizService.deleteOption(optionId);
      res.json({ success: true, message: 'Option deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  };

  // Start quiz attempt
  startQuizAttempt = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { quiz_id, user_id, video_id } = req.body;
      
      console.log('[QuizController] Starting quiz attempt with:', { quiz_id, user_id, video_id });
      
      if (!quiz_id || !user_id || !video_id) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields: quiz_id, user_id, video_id' 
        });
      }
      
      // Parse video_id
      const videoIdNum = typeof video_id === 'string' ? parseInt(video_id) : video_id;
      if (isNaN(videoIdNum)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid video_id format' 
        });
      }
      
      // Get quiz to get total_marks and verify quiz_id matches
      const quiz = await quizService.getQuizByVideoId(videoIdNum);
      if (!quiz) {
        return res.status(404).json({ 
          success: false, 
          error: 'Quiz not found for this video' 
        });
      }
      
      // Use quiz.id from database instead of request body quiz_id to ensure consistency
      const attempt = await quizService.startQuizAttempt({
        quiz_id: quiz.id, // Use the actual quiz ID from database
        user_id,
        video_id: videoIdNum,
        score: 0,
        total_marks: quiz.total_marks || 10,
        percentage: 0,
        passed: false
      });
      
      console.log('[QuizController] Quiz attempt started successfully:', attempt.id);
      res.status(201).json({ success: true, data: attempt });
    } catch (error: any) {
      console.error('[QuizController] Error starting quiz attempt:', error);
      console.error('[QuizController] Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        stack: error.stack
      });
      next(error);
    }
  };

  // Submit quiz attempt
  submitQuizAttempt = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { attemptId } = req.params;
      const { answers } = req.body;
      const parsedAttemptId = this.parseId(attemptId);
      const attempt = await quizService.submitQuizAttempt(parsedAttemptId, answers);
      res.json({ success: true, data: attempt });
    } catch (error: any) {
      next(error);
    }
  };

  // Get user quiz attempts
  getUserQuizAttempts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { videoId, userId } = req.params;
      const attempts = await quizService.getUserQuizAttempts(parseInt(videoId), userId);
      res.json({ success: true, data: attempts });
    } catch (error: any) {
      next(error);
    }
  };

  // Check if user has passed quiz
  hasUserPassedQuiz = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { videoId, userId } = req.params;
      const passed = await quizService.hasUserPassedQuiz(parseInt(videoId), userId);
      res.json({ success: true, data: { passed } });
    } catch (error: any) {
      next(error);
    }
  };
}

export default new QuizController();
