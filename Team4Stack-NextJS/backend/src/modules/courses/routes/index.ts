import { Router } from 'express';
import courseController from '../controllers/courseController';

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
