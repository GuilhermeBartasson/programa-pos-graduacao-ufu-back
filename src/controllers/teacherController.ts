import { Request, Response, NextFunction } from 'express';
import TeacherDAL from '../DAL/teacherDAL';

const createTeacher = async (req: Request, res: Response, next: NextFunction) => {
    const teacher = req.body;

    try {
        await TeacherDAL.createTeacher(teacher);
    } catch (err: any) {
        console.error(err);

        if (err?.code === '23505') return res.status(500).send('Já existe um docente com esse email.')

        return res.status(500).send('Houve um erro ao cadastrar este docente');
    }

    return res.status(201).send('Docente criado com sucesso');
}

export default { createTeacher };