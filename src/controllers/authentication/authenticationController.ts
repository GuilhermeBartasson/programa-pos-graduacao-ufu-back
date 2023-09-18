import { Request, Response, NextFunction } from "express";
import config from '../../config/default.json';

const getPublicKey = (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).send({ publicKey: process.env.PUBLIC_KEY });
}

export default { getPublicKey };