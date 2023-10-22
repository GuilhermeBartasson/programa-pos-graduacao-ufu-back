import express from 'express';
import authenticationRouter from './authenticationRouter';
import userRouter from './userRouter';
import researchLineRouter from './researchLineRouter';

const rootRouter = express.Router();

rootRouter.use('/authentication', authenticationRouter);
rootRouter.use('/user', userRouter);
rootRouter.use('/researchLine', researchLineRouter);

export default rootRouter;
