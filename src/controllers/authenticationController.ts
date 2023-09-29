import { Request, Response, NextFunction } from "express";

const getPublicKey = (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).send({ publicKey: process.env.PUBLIC_KEY });
}

export default { getPublicKey };