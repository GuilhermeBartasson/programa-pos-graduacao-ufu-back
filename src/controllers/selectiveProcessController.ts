import { Request, Response, NextFunction } from 'express';
import selectiveProcessDAL from '../DAL/selectiveProcessDAL';
import vacancyDAL from '../DAL/vacancyDAL';
import subscriptionFormFieldDAL from '../DAL/subscriptionFormFieldDAL';
import processDocumentDAL from '../DAL/processDocumentDAL';
import SelectiveProcess from '../models/selectiveProcess';
import db from '../config/database';
import { QueryResult } from 'pg';
import Modality from '../enums/modality';
import TargetPublic from '../enums/targetPublic';
import ProcessDocument from '../models/processDocument';
import SubscriptionFormField from '../models/subscriptionFormField';
import DoctorateVacancy from '../models/doctorateVacancy';
import ResearchLineDoctorateVacancy from '../models/researchLineDoctorateVacancy';
import ResearchLineMastersVacancy from '../models/researchLineMastersVacancy';
import PaginationObject from '../models/paginationObject';
import PaginationService from '../services/paginationService';

const createSelectiveProcess = async (req: Request, res: Response, next: NextFunction) => {
    const { selectiveProcess } = req.body;

    const sp: SelectiveProcess = selectiveProcess;
    const client = await db.getDbClient();
    let createProcessResult: QueryResult<any> | undefined;

    await client.query('BEGIN')

    try {
        createProcessResult = await selectiveProcessDAL.createSelectiveProcess(sp.name, sp.collegeId, sp.dates, sp.createdBy, client);

        const processId = createProcessResult?.rows[0].id;

        // Saving vacancy data for the masters modality
        if (sp.mastersVacancy !== undefined) {
            sp.mastersVacancy.forEach(async (mastersVacancy: ResearchLineMastersVacancy) => {
                if (mastersVacancy.regularVacancy !== undefined) {
                    await vacancyDAL.createVacancy(mastersVacancy.regularVacancy, Modality.Mestrado, TargetPublic.Regular, processId, mastersVacancy.researchLineId, undefined, client);
                }

                if (mastersVacancy.specialVacancy !== undefined) {
                    await vacancyDAL.createVacancy(mastersVacancy.specialVacancy, Modality.Mestrado, TargetPublic.Special, processId, mastersVacancy.researchLineId, undefined, client);
                }
            });
        }

        // Saving vacancy data for the doctorate modality
        if (sp.doctorateVacancy !== undefined) {
            sp.doctorateVacancy.forEach(async (doctorateVacancy: ResearchLineDoctorateVacancy) => {
                if (doctorateVacancy.vacancyPeriods !== undefined) {
                    doctorateVacancy.vacancyPeriods.forEach(async (period: DoctorateVacancy) => {
                        await vacancyDAL.createVacancy(period, Modality.Doutorado, TargetPublic.Regular, processId, doctorateVacancy.researchLineId, period.period, client);
                    });
                }
            });
        }

        // Saving form fields
        if (sp.subscriptionForm !== undefined) {
            sp.subscriptionForm.forEach(async (formField: SubscriptionFormField) => {
                await subscriptionFormFieldDAL.createSubscriptionFormField(processId, formField, client);
            });
        }

        // Saving documents related to personal information
        if (sp.personalDocuments !== undefined) {
            sp.personalDocuments.forEach(async (document: ProcessDocument) => {
                await processDocumentDAL.createProcessDocumentDAL(processId, document);
            });
        }

        // Saving document related to evaluation
        if (sp.evaluatedDocuments !== undefined) {
            sp.evaluatedDocuments.forEach(async (document: ProcessDocument) => {
                await processDocumentDAL.createProcessDocumentDAL(processId, document);
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

const getSelectiveProcessesCoverInformation = async (req: Request, res: Response, next: NextFunction) => {
    const { collegeId, paginate, page, size, showDeleted } = req.query;
    let selectiveProcesses: SelectiveProcess[] = [];
    let response: PaginationObject = { page: 0, size: 0, pageCount: 0, data: [] };

    try {
        if (collegeId !== undefined)
            selectiveProcesses = await selectiveProcessDAL.getSelectiveProcessesByCollegeId(parseInt(collegeId as string), showDeleted === 'true');
        else
            return res.status(400).send('Id de faculdade não informado');
    } catch (err) {
        console.error(err);
        return res.status(500).send('Houve um erro ao buscar pelos processos seletivos');
    }

    if (paginate === 'true') {
        if (size === undefined || page === undefined)
            return res.send(400).send('Os dados de paginação não foram informados ou foram informados de maneira incorreta');

        response = PaginationService.paginate(parseInt(page as string), parseInt(size as string), selectiveProcesses);
    } else {
        response.data = selectiveProcesses;
    }

    res.status(200).send(response);
}

const getSelectiveProcessFullInformation = async(req: Request, res: Response, next: NextFunction) => {
    const { processId } = req.query;
    let response: SelectiveProcess | undefined;
    let selectiveProcessCover: SelectiveProcess | undefined;

    try {
        if (processId !== undefined)
            selectiveProcessCover = await selectiveProcessDAL.getSelectiveProcessById(parseInt(processId as string));

            if (selectiveProcessCover !== undefined) response = selectiveProcessCover;

            
        else
            return res.status(400).send('Id do processo seletivo não informado');
    } catch (err) {
        console.error(err);
        return res.status(500).send('Houve um erro ao busca as informações deste processo seletivo');
    }

    return response;
}

export default { createSelectiveProcess, getSelectiveProcessesCoverInformation, getSelectiveProcessFullInformation };