import express from 'express';
import controller from '../controllers/selectiveProcessController';
import authMiddleare from '../middlewares/auth';

const router = express.Router();

router.post('/createSelectiveProcess', authMiddleare, controller.createSelectiveProcess);
router.get('/getSelectiveProcessesCoverInformation', authMiddleare, controller.getSelectiveProcessesCoverInformation);

export default router;