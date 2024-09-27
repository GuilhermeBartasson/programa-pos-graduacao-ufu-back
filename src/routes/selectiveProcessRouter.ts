import express from 'express';
import controller from '../controllers/selectiveProcessController';
import authMiddleare from '../middlewares/auth';

const router = express.Router();

router.post('/createSelectiveProcess', authMiddleare, controller.createSelectiveProcess);
router.get('/getSelectiveProcessesCover', authMiddleare, controller.getSelectiveProcessesCover);
router.get('/getSelectiveProcess', authMiddleare, controller.getSelectiveProcessFullInformation);
router.delete('/deleteSelectiveProcess', authMiddleare, controller.deleteSelectiveProcess)

export default router;