import express from 'express';
import mailRouter from './mail/mailRouter';
import authenticationRouter from './authentication/authenticationRouter';
import userRouter from './user/userRouter';

const rootRouter = express.Router();

rootRouter.use('/mail', mailRouter);
rootRouter.use('/authentication', authenticationRouter);
rootRouter.use('/user', userRouter);

export default rootRouter;
