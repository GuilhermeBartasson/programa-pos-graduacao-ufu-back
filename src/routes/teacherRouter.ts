import express from 'express';
import controller from '../controllers/teacherController';
import authMiddleare from '../middlewares/auth';

const router = express.Router();

router.post('/createTeacher', authMiddleare, controller.createTeacher);

export default router;