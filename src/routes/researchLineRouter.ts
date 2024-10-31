import express from 'express';
import controller from '../controllers/researchLineController';
import authMiddleware from '../middlewares/auth';

const router = express.Router();

router.post('/createResearchLine', authMiddleware, controller.createResearchLine);
router.get('/getResearchLines', authMiddleware, controller.getResearchLines);
router.put('/updateResearchLine', authMiddleware, controller.updateResearchLine);
router.delete('/deleteResearchLine', authMiddleware, controller.deleteResearchLine);
router.get('/getResearchLineById', authMiddleware, controller.getRearchLineById);
router.get('/getResearchLinesByIdList', authMiddleware, controller.getResearchLinesByIdList);

export default router;