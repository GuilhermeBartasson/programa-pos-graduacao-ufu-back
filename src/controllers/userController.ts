import e, { Request, Response, NextFunction } from 'express';
import User from '../models/user';
import UserDAL from '../DAL/userDAL';
import { CryptoService, HashWithSaltResponse } from '../services/cryptoService';
import UserService from '../services/userService';
import MailService from '../services/mailService';

const createApplicantUser = async (req: Request, res: Response, next: NextFunction) => {
    const user: User = req.body;

    if (!UserService.userIsValidforSignup(user)) return res.status(500).send({ message: 'Alguns dados estão faltando' });

    let decryptedPassword: string = CryptoService.privateDecrypt(user.password);

    let hashResponse: HashWithSaltResponse = CryptoService.hashWithSalt(decryptedPassword);

    user.password = hashResponse.hash;
    user.salt = hashResponse.salt;
    user.validationCode = CryptoService.generateSalt();

    try {
        await UserDAL.createApplicantUser(user);
    } catch (err: any) {
        if (err?.code === '23505') return res.status(500).send('Já existe uma conta de usuário utilizando esse email.')

        return res.status(500).send('Houve um erro ao criar esta conta de usuário');
    }

    MailService.sendMail(
        user.email, 
        'Confirmação de Conta', 
        `Parabéns, sua conta foi criada com sucesso, clique no link a seguir para confirmar sua conta: http://localhost:4200/validateAccount/${user.validationCode}`
    );

    return res.status(201).send({ message: 'Usuário criado com sucesso' });
}

const validateApplicantAccount = async (req: Request, res: Response, next: NextFunction) => {
    const { validationCode } = req.query;

    if ((validationCode as string).trim() === '' || validationCode === undefined) 
        return res.status(500).send({ message: 'Não foi informado um código de validação' });

    try {
        await UserDAL.validateApplicantAccount(validationCode as string);
    } catch(err: any) {
        return res.status(500).send('Houve um erro ao validar esta conta de usuário');
    }

    return res.status(201).send({ message: 'Conta validada com sucesso' });
}

const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { password, passwordResetCode } = req.body;

    if ((password as string).trim() === '' || password === undefined || (passwordResetCode as string).trim() === '' || passwordResetCode === undefined)
        return res.status(500).send({ message: 'A senha ou email não foram informados' });

    let decryptedPassword: string = CryptoService.privateDecrypt(password);

    let hashResponse: HashWithSaltResponse = CryptoService.hashWithSalt(decryptedPassword);

    let hashedPassword: string = hashResponse.hash;
    let salt: string = hashResponse.salt;

    try {
        await UserDAL.updatePassword(hashedPassword, salt, passwordResetCode);
    } catch (err: any) {
        return res.status(500).send('Houve um erro ao redefinir a senha');
    }

    return res.status(201).send({ message: 'Senha redefinida com sucesso' });
}

const checkPasswordResetDate = async (req: Request, res: Response, next: NextFunction) => {
    const { passwordResetCode } = req.query;

    if ((passwordResetCode as string).trim() === '' || passwordResetCode === undefined)
        return res.status(500).send({ message: 'Um endereço de email não foi informado' });

    let valid: boolean = false;

    try {
        await UserDAL.isPasswordResetExpired(passwordResetCode as string).then(res => {
            valid = res;
        });
    } catch (err) {
        return res.status(500).send('Houve um erro ao validar a data de expiração da redefinição de senha');
    }

    return res.status(201).send(valid);
}

export default { createApplicantUser, validateApplicantAccount, resetPassword, checkPasswordResetDate };
