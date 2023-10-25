import express from 'express';
import authenticationRouter from './authenticationRouter';
import userRouter from './userRouter';
import researchLineRouter from './researchLineRouter';
import teacherRouter from './teacherRouter';

const rootRouter = express.Router();

rootRouter.use('/authentication', authenticationRouter);
rootRouter.use('/user', userRouter);
rootRouter.use('/researchLine', researchLineRouter);
rootRouter.use('/teacher', teacherRouter)

export default rootRouter;
