import express from 'express';
import controller from '../controllers/collegeController';
import authMiddleware from '../middlewares/auth';

const router = express.Router();

router.post('/createCollege', authMiddleware, controller.createCollege);
router.get('/getColleges', authMiddleware, controller.getColleges);
router.post('/updateCollege', authMiddleware, controller.updateCollege);
router.get('/deleteCollege', authMiddleware, controller.deleteCollege);

export default router;