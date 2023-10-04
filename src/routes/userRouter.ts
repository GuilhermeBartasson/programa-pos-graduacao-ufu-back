import express from 'express';
import controller from '../controllers/userController';

const router = express.Router();

router.post('/createApplicantUser', controller.createApplicantUser);
router.get('/validateApplicantAccount', controller.validateApplicantAccount);
router.post('/resetPassword', controller.resetPassword);
router.get('/checkPasswordResetDate', controller.checkPasswordResetDate);
router.post('/sendPasswordResetMail', controller.sendPasswordResetMail);

export default router;
