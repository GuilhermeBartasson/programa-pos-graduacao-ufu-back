import express from 'express';
import controller from '../controllers/collegeController';
import authMiddleware from '../middlewares/auth';

const router = express.Router();

router.post('/createCollege', authMiddleware, controller.createCollege);

export default router;