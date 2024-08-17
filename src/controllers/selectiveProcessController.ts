import { Request, Response, NextFunction } from 'express';
import selectiveProcessDAL from '../DAL/selectiveProcessDAL';
import SelectiveProcess from '../models/selectiveProcess';

const createSelectiveProcess = async (req: Request, res: Response, next: NextFunction) => {
    const { selectiveProcess } = req.body;

    let sp: SelectiveProcess = selectiveProcess;

    try {
        await selectiveProcessDAL.createSelectiveProcess(sp.name, sp.collegeId, sp.dates, sp.createdBy);
    } catch (err) {
        console.error(err);

        return res.status(500).send('Houve um erro ao criar esse processo seletivo');
    }

    return res.status(201).send('Processo seletivo criado com sucesso');
}

export default { createSelectiveProcess };