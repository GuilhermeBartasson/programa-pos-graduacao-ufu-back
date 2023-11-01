import { Request, Response, NextFunction } from 'express';
import TeacherDAL from '../DAL/teacherDAL';
import Teacher from '../models/teacher';
import PaginationObject from '../models/paginationObject';
import PaginationService from '../services/paginationService';

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

const getTeachers = async (req: Request, res: Response, next: NextFunction) => {
    const { paginate, page, size } = req.query;
    let response: PaginationObject = { page: 0, size: 0, pageCount: 0, data: [] };
    let teachers: Teacher[] = [];

    try {
        teachers = await TeacherDAL.getTeachers();
    } catch (err) {
        console.error(err);
        return res.status(500).send('Houve um erro ao buscar por docentes');
    }

    if (paginate === 'true') {
        if (size === undefined || page === undefined)
            return res.send(500).send('Os dados de paginação não foram informados ou foram informados de maneira incorreta');

        response = PaginationService.paginate(parseInt(page as string), parseInt(size as string), teachers);
    } else {
        response.data = teachers;
    }

    res.status(200).send(response);
}

const updateTeacher = async (req: Request, res: Response, next: NextFunction) => {
    const teacher = req.body;

    try {
        await TeacherDAL.updateTeacher(teacher);
    } catch (err: any) {
        console.error(err);

        return res.status(500).send('Houve um erro ao editar esse docente');
    }

    return res.status(200).send('Docente editado com sucesso');
}

const deleteTeacher = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.query;

    try {
        await TeacherDAL.deleteTeacher(parseInt(id as string));
    } catch (err: any) {
        console.error(err);

        return res.status(500).send('Houve um erro ao deletar esse docente');
    }

    return res.status(200).send('Docente deletado');
}

export default { createTeacher, getTeachers, updateTeacher, deleteTeacher };