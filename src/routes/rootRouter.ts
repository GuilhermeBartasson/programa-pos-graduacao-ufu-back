import express from 'express';
import mailRouter from './mailRouter';
import authenticationRouter from './authenticationRouter';
import userRouter from './userRouter';

const rootRouter = express.Router();

rootRouter.use('/mail', mailRouter);
rootRouter.use('/authentication', authenticationRouter);
rootRouter.use('/user', userRouter);

export default rootRouter;
