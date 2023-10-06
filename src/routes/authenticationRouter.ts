import express from 'express';
import controller from '../controllers/authenticationController'

const router = express.Router();

router.get('/getPublicKey', controller.getPublicKey);
router.post('/login', controller.login);

export default router;
