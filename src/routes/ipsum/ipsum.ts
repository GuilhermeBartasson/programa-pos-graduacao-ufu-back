import express from 'express';
import controller from '../../controllers/ipsum/ipsum';
const router = express.Router();

router.get('/', controller.get);

export = router;