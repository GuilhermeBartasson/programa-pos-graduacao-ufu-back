import express from 'express';
import controller from '../../controllers/mail/mailController';

const router = express.Router();

router.post('/sendMail', controller.sendMail);

export default router;