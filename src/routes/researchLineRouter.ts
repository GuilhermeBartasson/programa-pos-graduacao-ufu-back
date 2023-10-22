import express from 'express';
import controller from '../controllers/researchLineController';
import authMiddleare from '../middlewares/auth';

const router = express.Router();

router.post('/createResearchLine', authMiddleare, controller.createResearchLine)

export default router;