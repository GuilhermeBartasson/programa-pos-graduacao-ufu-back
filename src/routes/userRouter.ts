import express from 'express';
import controller from '../controllers/userController';

const router = express.Router();

router.post('/createApplicantUser', controller.createApplicantUser);

export default router;
