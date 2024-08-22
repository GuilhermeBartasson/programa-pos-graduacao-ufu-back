import { Request, Response, NextFunction } from 'express';
import selectiveProcessDAL from '../DAL/selectiveProcessDAL';
import vacancyDAL from '../DAL/vacancyDAL';
import SelectiveProcess from '../models/selectiveProcess';
import db from '../config/database';
import { QueryResult } from 'pg';
import Modality from '../enums/modality';
import TargetPublic from '../enums/targetPublic';

const createSelectiveProcess = async (req: Request, res: Response, next: NextFunction) => {
    const { selectiveProcess } = req.body;

    const sp: SelectiveProcess = selectiveProcess;
    const client = await db.getDbClient();
    let createProcessResult: QueryResult<any> | undefined;

    console.log(sp.doctorateVacancy[0]);

    await client.query('BEGIN')

    try {
        createProcessResult = await selectiveProcessDAL.createSelectiveProcess(sp.name, sp.collegeId, sp.dates, sp.createdBy, client);

        const processId = createProcessResult?.rows[0].id;

        if (sp.mastersVacancy !== undefined) {
            sp.mastersVacancy.forEach(async (mastersVacancy) => {
                if (mastersVacancy.regularVacancy !== undefined) {
                    await vacancyDAL.createVacancy(mastersVacancy.regularVacancy, Modality.Mestrado, TargetPublic.Regular, processId, mastersVacancy.researchLineId, undefined, client);
                }

                if (mastersVacancy.specialVacancy !== undefined) {
                    await vacancyDAL.createVacancy(mastersVacancy.specialVacancy, Modality.Mestrado, TargetPublic.Special, processId, mastersVacancy.researchLineId, undefined, client);
                }
            });
        }

        if (sp.doctorateVacancy !== undefined) {
            sp.doctorateVacancy.forEach(async (doctorateVacancy) => {
                if (doctorateVacancy.vacancyPeriods !== undefined) {
                    doctorateVacancy.vacancyPeriods.forEach(async (period) => {
                        await vacancyDAL.createVacancy(period, Modality.Doutorado, TargetPublic.Regular, processId, doctorateVacancy.researchLineId, period.period, client);
                    });
                }
            });
        }

        await client.query('COMMIT');
    } catch (err) {
        console.error(err);
        await client.query('ROLLBACK');
        return res.status(500).send('Houve um erro ao criar esse processo seletivo');
    } finally {
        client.release();
    }

    return res.status(201).send('Processo seletivo criado com sucesso');
}

export default { createSelectiveProcess };