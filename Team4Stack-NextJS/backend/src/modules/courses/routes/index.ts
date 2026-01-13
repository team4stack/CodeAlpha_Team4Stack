import { Router } from 'express';
import courseController from '../controllers/courseController';

const router = Router();

// Course routes
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);
router.post('/', courseController.createCourse);
router.put('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);

// Video routes
router.get('/:courseId/videos', courseController.getCourseVideos);
router.post('/videos', courseController.createVideo);
router.put('/videos/:id', courseController.updateVideo);
router.delete('/videos/:id', courseController.deleteVideo);

// Admission form routes
router.get('/admissions', courseController.getAdmissionForms);
router.post('/admissions', courseController.createAdmissionForm);
router.put('/admissions/:id', courseController.updateAdmissionForm);
router.delete('/admissions/:id', courseController.deleteAdmissionForm);

// Progress routes
router.get('/progress/:userId', courseController.getUserProgress);
router.post('/progress', courseController.updateProgress);

export default router;
