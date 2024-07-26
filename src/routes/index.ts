import * as express from 'express'
import { userRouter } from './user.routes';

const Router = express.Router();

Router.use('/users', userRouter)

export { Router as apiRouter }