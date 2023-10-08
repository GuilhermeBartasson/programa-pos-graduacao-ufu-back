import { Request, Response, NextFunction } from "express";
import { CryptoService } from "../services/cryptoService";

const auth = (req: Request, res: Response, next: NextFunction) => {
    if (CryptoService.verifyJwtToken(req.headers.authorization as string)) {
        next();
    } else {
        next('Unauthorized');
    }
}

export default auth;