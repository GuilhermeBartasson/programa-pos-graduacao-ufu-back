import express from 'express';
import controller from '../controllers/documentController';
import authMiddleware from '../middlewares/auth';

const router = express.Router();

router.post('/createDocument', authMiddleware, controller.createDocument);

export default router;