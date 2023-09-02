import { Request, Response, NextFunction } from "express";
import axios, { AxiosResponse } from 'axios';

const get = (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json({ message: 'Ok' });
}

export default { get };