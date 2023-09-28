import express from 'express';
import controller from '../controllers/authenticationController'

const router = express.Router();

router.get('/getPublicKey', controller.getPublicKey);

export default router;
