import { Request, Response, NextFunction } from 'express';
import User from '../models/user';
import UserDAL from '../DAL/userDAL';
import { CryptoService, HashWithSaltResponse } from '../services/cryptoService';

const createApplicantUser = async (req: Request, res: Response, next: NextFunction) => {
    const user: User = req.body;

    if (!userIsValidforSignup(user)) return res.status(500).send({ message: 'Alguns dados estão faltando' })

    let decryptedPassword: string = CryptoService.privateDecrypt(user.password);

    let hashResponse: HashWithSaltResponse = CryptoService.hashWithSalt(decryptedPassword);

    user.password = hashResponse.hash;
    user.salt = hashResponse.salt;

    try {
        await UserDAL.createApplicantUser(user);
    } catch (err: any) {
        if (err?.code === '23505') return res.status(500).send('Já existe uma conta de usuário utilizando esse email.')

        return res.status(500).send('Houve um erro ao criar esta conta de usuário');
    }

    return res.status(201).send({ message: 'Usuário criado com sucesso' });
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
