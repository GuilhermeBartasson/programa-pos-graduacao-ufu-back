import { Request, Response, NextFunction } from 'express';
import User from '../../models/user';
import UserDAL from '../../DAL/userDAL';
import * as crypto from 'crypto';

const createApplicantUser = async (req: Request, res: Response, next: NextFunction) => {
    const user: User = req.body;

    if (!userIsValidforSignup(user)) return res.status(500).send({ message: 'Alguns dados estão faltando' })

    let salt: string = crypto.randomBytes(16).toString('hex');
    let hasher: crypto.Hash = crypto.createHash('sha256');

    // hasher.update(crypto.privateDecrypt(process.env.PRIVATE_KEY as string, Buffer.from(user.password)).toString() + salt);
    hasher.update(user.password + salt);

    let hash = hasher.digest('hex');

    user.password = hash;
    user.salt = salt;

    try {
        await UserDAL.createApplicantUser(user);
    } catch (err) {
        return res.status(500).send({ message: 'Houve um erro ao criar esta conta de usuário', err });
    }

    return res.status(200).send({ message: 'Usuário criado com sucesso' });
}

//#region Private Functions

const userIsValidforSignup = (user: User) => {
    let valid: boolean = true;

    if (!user.email || user.email.trim() === '') valid = false;
    if (!user.firstName || user.firstName.trim() === '') valid = false;
    if (!user.lastName || user.lastName.trim() === '') valid = false;
    if (!user.password || user.password.trim() === '') valid = false;

    return valid;
}

//#endregion Private Functions

export default { createApplicantUser };
