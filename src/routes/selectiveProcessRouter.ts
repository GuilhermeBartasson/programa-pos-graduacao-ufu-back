import express from 'express';
import controller from '../controllers/selectiveProcessController';
import authMiddleare from '../middlewares/auth';
import multer from 'multer';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/createSelectiveProcess', authMiddleare, controller.createSelectiveProcess);
router.get('/getSelectiveProcessesCover', authMiddleare, controller.getSelectiveProcessesCover);
router.get('/getSelectiveProcess', authMiddleare, controller.getSelectiveProcessFullInformation);
router.delete('/deleteSelectiveProcess', authMiddleare, controller.deleteSelectiveProcess);
router.put('/updateSeletiveProcess', authMiddleare, controller.updateSelectiveProcess);
router.post('/saveSubscriptionInformation', authMiddleare, controller.saveSubscriptionInformation);
router.post('/saveSubscriptionFiles', authMiddleare, upload.array('processFile'), controller.saveSubscriptionFiles);

export default router;