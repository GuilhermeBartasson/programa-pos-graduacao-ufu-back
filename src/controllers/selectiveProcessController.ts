import { Request, Response, NextFunction } from 'express';
import selectiveProcessDAL from '../DAL/selectiveProcessDAL';

const createSelectiveProcess = async (req: Request, res: Response, next: NextFunction) => {
    const { selectiveProcess } = req.body;

    try {
        await selectiveProcessDAL.createSelectiveProcess(selectiveProcess);
    } catch (err) {
        console.error(err);

        return res.status(500).send('Houve um erro ao criar esse processo seletivo');
    }

    return res.status(201).send('Processo seletivo criado com sucesso');
}

export default { createSelectiveProcess };