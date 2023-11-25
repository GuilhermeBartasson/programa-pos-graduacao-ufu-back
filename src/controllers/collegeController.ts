import { Request, Response, NextFunction } from 'express';
import CollegeDAL from '../DAL/collegeDAL';
import College from '../models/college';
import PaginationObject from '../models/paginationObject';
import PaginationService from '../services/paginationService';

const createCollege = async (req: Request, res: Response, next: NextFunction) => {
    const college = req.body;

    try {
        await CollegeDAL.createCollege(college);
    } catch (err) {
        console.error(err);

        return res.status(500).send('Houve um erro ao criar esta faculdade');
    }

    return res.status(201).send('Faculdade criada com sucesso');
}

const getColleges = async (req: Request, res: Response, next: NextFunction) => {
    const { paginate, page, size, showDeleted } = req.query;
    let response: PaginationObject = { page: 0, size: 0, pageCount: 0, data: [] };
    let colleges: College[] = [];

    try {
        colleges = await CollegeDAL.getColleges(showDeleted === 'true');
    } catch (err) {
        console.error(err);

        res.status(500).send('Houve um erro ao buscar por faculdades');
    }

    if (paginate === 'true') {
        if (size === undefined || page === undefined)
            return res.send(500).send('Os dados de paginação não foram informados ou foram informados de maneira incorreta');

        response = PaginationService.paginate(parseInt(page as string), parseInt(size as string), colleges);
    } else {
        response.data = colleges;
    }

    res.status(200).send(response);
}

const updateCollege = async (req: Request, res: Response, next: NextFunction) => {
    const college = req.body;

    try {
        await CollegeDAL.updateCollege(college);
    } catch (err) {
        console.error(err);

        return res.status(500).send('Houve um erro ao atualizar esta faculdade');
    }

    return res.status(200).send('Faculdade atualizada com sucesso');
}

const deleteCollege = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.query;

    try {
        await CollegeDAL.deleteCollege(parseInt(id as string));
    } catch (err) {
        console.error(err);

        return res.status(500).send('Houve um erro ao deletar esta faculdade');
    }

    return res.status(200).send('Faculdade deletada');
}

export default { createCollege, getColleges, updateCollege, deleteCollege }