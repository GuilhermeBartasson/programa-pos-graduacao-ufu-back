import express from 'express';
import controller from '../controllers/userController';

const router = express.Router();

router.post('/createApplicantUser', controller.createApplicantUser);
router.get('/validateApplicantAccount', controller.validateApplicantAccount);

export default router;
