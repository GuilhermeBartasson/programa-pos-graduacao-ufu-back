import { Request, Response, NextFunction } from 'express';
import ResearchLineDAL from '../DAL/researchLineDAL';
import ResearchLine from '../models/researchLine';
import PaginationObject from '../models/paginationObject';
import PaginationService from '../services/paginationService';

const createResearchLine = async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.body;

    try {
        await ResearchLineDAL.createResearchLine(name);
    } catch (err: any) {
        console.error(err);

        if (err?.code === '23505') return res.status(500).send('Já existe uma linha de pesquisa com este nome.')

        return res.status(500).send('Houve um erro ao criar essa linha de pesquisa');
    }

    return res.status(201).send('Linha de pesquisa criada com sucesso');
}

const getResearchLines = async (req: Request, res: Response, next: NextFunction) => {
    const { paginate, page, size } = req.query;
    let response: PaginationObject = { page: 0, size: 0, pageCount: 0, data: [] };
    let researchLines: ResearchLine[] = [];

    try {
        researchLines = await ResearchLineDAL.getResearchLines();
    } catch (err) {
        console.error(err);
        return res.status(500).send('Houve um erro ao buscar pelas linhas de pesquisa');
    }

    if (paginate === 'true') {
        if (size === undefined || page === undefined)
            return res.send(500).send('Os dados de paginação não foram informados ou foram informados de maneira incorreta');

        response = PaginationService.paginate(parseInt(page as string), parseInt(size as string), researchLines);
    }

    return res.status(200).send({ response })
}

export default { createResearchLine, getResearchLines };