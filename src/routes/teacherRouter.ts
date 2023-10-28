import express from 'express';
import controller from '../controllers/teacherController';
import authMiddleare from '../middlewares/auth';

const router = express.Router();

router.post('/createTeacher', authMiddleare, controller.createTeacher);
router.get('/getTeachers', authMiddleare, controller.getTeachers);
router.put('/updateTeacher', authMiddleare, controller.updateTeacher);
router.delete('/deleteTeacher', authMiddleare, controller.deleteTeacher);

export default router;