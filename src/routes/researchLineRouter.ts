import express from 'express';
import controller from '../controllers/researchLineController';
import authMiddleare from '../middlewares/auth';

const router = express.Router();

router.post('/createResearchLine', authMiddleare, controller.createResearchLine);
router.get('/getResearchLines', authMiddleare, controller.getResearchLines);

export default router;