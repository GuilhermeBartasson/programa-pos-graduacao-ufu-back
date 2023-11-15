import express from 'express';
import controller from '../controllers/teacherController';
import authMiddleware from '../middlewares/auth';

const router = express.Router();

router.post('/createTeacher', authMiddleware, controller.createTeacher);
router.get('/getTeachers', authMiddleware, controller.getTeachers);
router.put('/updateTeacher', authMiddleware, controller.updateTeacher);
router.delete('/deleteTeacher', authMiddleware, controller.deleteTeacher);

export default router;