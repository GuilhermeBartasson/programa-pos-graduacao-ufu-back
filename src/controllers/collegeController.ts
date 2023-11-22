import { Request, Response, NextFunction } from 'express';
import CollegeDAL from '../DAL/collegeDAL';

const createCollege = async (req: Request, res: Response, next: NextFunction) => {
    const { college } = req.body;

    try {
        await CollegeDAL.createCollege(college);
    } catch (err) {
        console.error(err);

        return res.status(500).send('Houve um erro ao criar esta faculdade');
    }

    return res.status(201).send('Faculdade criada com sucesso');
}

export default { createCollege }