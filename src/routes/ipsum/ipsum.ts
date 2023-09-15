import express from 'express';
import controller from '../../controllers/ipsum/ipsum';
const router = express.Router();

// router.get('/', controller.get);

router.post('/sendMail', controller.sendMail);

export = router;