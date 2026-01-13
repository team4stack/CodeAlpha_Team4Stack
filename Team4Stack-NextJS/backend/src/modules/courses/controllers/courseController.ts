import { Request, Response, NextFunction } from 'express';
import courseService from '../services/courseService';

export class CourseController {
  // Get all courses
  getAllCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courses = await courseService.getAllCourses();
      res.json({ success: true, data: courses });
    } catch (error: any) {
      next(error);
    }
  };

  // Get course by ID
  getCourseById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const course = await courseService.getCourseById(parseInt(id));
      if (!course) {
        return res.status(404).json({ success: false, error: 'Course not found' });
      }
      res.json({ success: true, data: course });
    } catch (error: any) {
      next(error);
    }
  };

  // Create course
  createCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const course = await courseService.createCourse(req.body);
      res.status(201).json({ success: true, data: course });
    } catch (error: any) {
      next(error);
    }
  };

  // Update course
  updateCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const course = await courseService.updateCourse(parseInt(id), req.body);
      res.json({ success: true, data: course });
    } catch (error: any) {
      next(error);
    }
  };

  // Delete course
  deleteCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await courseService.deleteCourse(parseInt(id));
      res.json({ success: true, message: 'Course deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  };

  // Get course videos
  getCourseVideos = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;
      const videos = await courseService.getCourseVideos(parseInt(courseId));
      res.json({ success: true, data: videos });
    } catch (error: any) {
      next(error);
    }
  };

  // Create video
  createVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const video = await courseService.createVideo(req.body);
      res.status(201).json({ success: true, data: video });
    } catch (error: any) {
      next(error);
    }
  };

  // Update video
  updateVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const video = await courseService.updateVideo(parseInt(id), req.body);
      res.json({ success: true, data: video });
    } catch (error: any) {
      next(error);
    }
  };

  // Delete video
  deleteVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await courseService.deleteVideo(parseInt(id));
      res.json({ success: true, message: 'Video deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  };

  // Get admission forms
  getAdmissionForms = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, approved, course_name } = req.query;
      const filters: any = {};
      if (email) filters.email = email as string;
      if (approved !== undefined) filters.approved = approved === 'true';
      if (course_name) filters.course_name = course_name as string;

      const forms = await courseService.getAdmissionForms(filters);
      res.json({ success: true, data: forms });
    } catch (error: any) {
      next(error);
    }
  };

  // Create admission form
  createAdmissionForm = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const form = await courseService.createAdmissionForm(req.body);
      res.status(201).json({ success: true, data: form });
    } catch (error: any) {
      next(error);
    }
  };

  // Update admission form
  updateAdmissionForm = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const form = await courseService.updateAdmissionForm(parseInt(id), req.body);
      res.json({ success: true, data: form });
    } catch (error: any) {
      next(error);
    }
  };

  // Get user progress
  getUserProgress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { courseId } = req.query;
      const progress = await courseService.getUserProgress(
        userId,
        courseId ? parseInt(courseId as string) : undefined
      );
      res.json({ success: true, data: progress });
    } catch (error: any) {
      next(error);
    }
  };

  // Update progress
  updateProgress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const progress = await courseService.updateProgress(req.body);
      res.json({ success: true, data: progress });
    } catch (error: any) {
      next(error);
    }
  };
}

export default new CourseController();
