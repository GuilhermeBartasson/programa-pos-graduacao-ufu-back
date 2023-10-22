import { Request, Response, NextFunction } from 'express';
import ResearchLineDAL from '../DAL/researchLineDAL';

const createResearchLine = async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.body;

    try {
        await ResearchLineDAL.createResearchLine(name);
    } catch (err) {
        console.error(err);

        return res.status(500).send('Houve um erro ao criar essa linha de pesquisa');
    }

    return res.status(201).send('Linha de pesquisa criada com sucesso');
}

export default { createResearchLine };