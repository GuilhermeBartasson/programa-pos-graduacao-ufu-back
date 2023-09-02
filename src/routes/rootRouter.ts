import express from 'express';
import ipsum from './ipsum/ipsum';

const rootRouter = express.Router();

rootRouter.use('/ipsum', ipsum);

export = rootRouter;
