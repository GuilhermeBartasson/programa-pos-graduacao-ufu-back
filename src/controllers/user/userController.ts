import { Request, Response, NextFunction } from 'express';
import User from '../../models/user';
import UserDAL from '../../DAL/userDAL';

const createApplicantUser = async (req: Request, res: Response, next: NextFunction) => {
    const user: User = req.body;

    try {
        await UserDAL.createApplicantUser(user);
    } catch (err) {
        res.status(500).send({ message: 'Houve um erro ao criar esta conta de usuário', err });
    }

    res.status(200).send({ message: 'Usuário criado com sucesso' });
}

export default { createApplicantUser };
