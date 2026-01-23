import { Router } from 'express';
import courseController from '../controllers/courseController';
import quizController from '../controllers/quizController';

const router = Router();

// Progress routes (must come before /:id to avoid route conflicts)
router.get('/progress', courseController.getAllProgress);
router.get('/progress/:userId', courseController.getUserProgress);
router.post('/progress', courseController.updateProgress);

// Admission form routes (must come before /:id)
router.get('/admissions', courseController.getAdmissionForms);
router.post('/admissions', courseController.createAdmissionForm);
router.put('/admissions/:id', courseController.updateAdmissionForm);
router.delete('/admissions/:id', courseController.deleteAdmissionForm);

// Quiz routes (must come before /:id to avoid route conflicts)
router.get('/quizzes/video/:videoId', quizController.getQuizByVideoId);
router.post('/quizzes', quizController.createQuiz);
router.put('/quizzes/:id', quizController.updateQuiz);
router.delete('/quizzes/:id', quizController.deleteQuiz);
router.post('/quizzes/questions', quizController.createQuestion);
router.put('/quizzes/questions/:id', quizController.updateQuestion);
router.delete('/quizzes/questions/:id', quizController.deleteQuestion);
router.post('/quizzes/options', quizController.createOption);
router.put('/quizzes/options/:id', quizController.updateOption);
router.delete('/quizzes/options/:id', quizController.deleteOption);
router.post('/quizzes/attempts/start', quizController.startQuizAttempt);
router.post('/quizzes/attempts/:attemptId/submit', quizController.submitQuizAttempt);
router.get('/quizzes/attempts/:videoId/:userId', quizController.getUserQuizAttempts);
router.get('/quizzes/check/:videoId/:userId', quizController.hasUserPassedQuiz);

// Video routes (must come before /:id)
router.get('/:courseId/videos', courseController.getCourseVideos);
router.post('/videos', courseController.createVideo);
router.put('/videos/:id', courseController.updateVideo);
router.delete('/videos/:id', courseController.deleteVideo);

// Course routes (/:id must come last to avoid conflicts)
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);
router.post('/', courseController.createCourse);
router.put('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);

export default router;
