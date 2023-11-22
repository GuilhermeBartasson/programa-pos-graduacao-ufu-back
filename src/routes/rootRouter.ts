import express from 'express';
import authenticationRouter from './authenticationRouter';
import userRouter from './userRouter';
import researchLineRouter from './researchLineRouter';
import teacherRouter from './teacherRouter';
import selectiveProcessRouter from './selectiveProcessRouter';
import documentRouter from './documentRouter';
import collegeRouter from './collegeRouter';

const rootRouter = express.Router();

rootRouter.use('/authentication', authenticationRouter);
rootRouter.use('/user', userRouter);
rootRouter.use('/researchLine', researchLineRouter);
rootRouter.use('/teacher', teacherRouter);
rootRouter.use('/selectiveProcess', selectiveProcessRouter);
rootRouter.use('/document', documentRouter);
rootRouter.use('/college', collegeRouter)

export default rootRouter;
