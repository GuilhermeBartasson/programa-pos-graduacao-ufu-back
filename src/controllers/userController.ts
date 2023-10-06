import e, { Request, Response, NextFunction } from 'express';
import User from '../models/user';
import UserDAL from '../DAL/userDAL';
import { CryptoService, HashWithSaltResponse } from '../services/cryptoService';
import UserService from '../services/userService';
import MailService from '../services/mailService';

const createApplicantUser = async (req: Request, res: Response, next: NextFunction) => {
    const user: User = req.body;

    if (!UserService.userIsValidforSignup(user)) return res.status(500).send('Alguns dados estão faltando');

    const decryptedPassword: string = CryptoService.privateDecrypt(user.password);

    const hashResponse: HashWithSaltResponse = CryptoService.hashAndReturnSalt(decryptedPassword);

    user.password = hashResponse.hash;
    user.salt = hashResponse.salt;
    user.validationCode = CryptoService.generateSalt();

    try {
        await UserDAL.createApplicantUser(user);
    } catch (err: any) {
        console.error(err);

        if (err?.code === '23505') return res.status(500).send('Já existe uma conta de usuário utilizando esse email.')

        return res.status(500).send('Houve um erro ao criar esta conta de usuário');
    }

    MailService.sendMail(
        user.email, 
        'Confirmação de Conta', 
        `Parabéns, sua conta foi criada com sucesso, clique no link a seguir para confirmar sua conta: http://localhost:4200/validateAccount/${user.validationCode}`
    );

    return res.status(201).send('Usuário criado com sucesso');
}

const validateApplicantAccount = async (req: Request, res: Response, next: NextFunction) => {
    const { validationCode } = req.query;

    if ((validationCode as string).trim() === '' || validationCode === undefined) 
        return res.status(500).send('Não foi informado um código de validação');

    try {
        await UserDAL.validateApplicantAccount(validationCode as string);
    } catch(err: any) {
        console.error(err);
        return res.status(500).send('Houve um erro ao validar esta conta de usuário');
    }

    return res.status(200).send('Conta validada com sucesso');
}

const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { password, passwordResetCode } = req.body;

    if ((password as string).trim() === '' || password === undefined || (passwordResetCode as string).trim() === '' || passwordResetCode === undefined)
        return res.status(500).send('A senha ou email não foram informados');

    const decryptedPassword: string = CryptoService.privateDecrypt(password);

    const hashResponse: HashWithSaltResponse = CryptoService.hashAndReturnSalt(decryptedPassword);

    const hashedPassword: string = hashResponse.hash;
    const salt: string = hashResponse.salt;

    try {
        await UserDAL.updatePassword(hashedPassword, salt, passwordResetCode);
    } catch (err: any) {
        console.error(err);
        return res.status(500).send('Houve um erro ao redefinir a senha');
    }

    return res.status(200).send('Senha redefinida com sucesso');
}

const checkPasswordResetDate = async (req: Request, res: Response, next: NextFunction) => {
    const { passwordResetCode } = req.query;

    if ((passwordResetCode as string).trim() === '' || passwordResetCode === undefined)
        return res.status(500).send('Um código de redefinição de senha não foi informado');

    let valid: boolean = false;

    try {
        await UserDAL.isPasswordResetExpired(passwordResetCode as string).then(res => {
            valid = res;
        });
    } catch (err: any) {
        console.error(err);
        return res.status(500).send('Houve um erro ao validar a data de expiração da redefinição de senha');
    }

    return res.status(200).send(valid);
}

const sendPasswordResetMail = async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    if ((email as string).trim() === '' || email === undefined)
        return res.status(500).send('Um email não foi informado')

    try {
        const user = await UserDAL.getUserByMail(email as string);

        if (user) {
            const resetCode = CryptoService.generateSalt();

            await UserDAL.setUserPasswordResetCode(email, resetCode);

            MailService.sendMail(email, 'Redfinição de Senha Portal de Pós Graduação', `Uma redfinição de senha foi solicitada para a sua conta, clique no link a seguir para redefinir sua senha http://localhost:4200/resetPassword/${resetCode}<br>Esee link deixará de ser válido em 15 minutos.`);
        } else {
            return res.status(500).send('Não foi possível encontrar uma conta vinculada a esse endereço de email');
        }
    } catch (err: any) {
        console.error(err);
        return res.status(500).send('Houve um erro ao enviar o email de redfinição de senha');
    }

    return res.status(200).send('Email de redefinição de senha enviado com sucesso');
}

export default { createApplicantUser, validateApplicantAccount, resetPassword, checkPasswordResetDate, sendPasswordResetMail };
