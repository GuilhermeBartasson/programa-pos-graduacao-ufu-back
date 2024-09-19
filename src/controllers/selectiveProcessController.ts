import { Request, Response, NextFunction } from 'express';
import SelectiveProcessDAL from '../DAL/selectiveProcessDAL';
import VacancyDAL from '../DAL/vacancyDAL';
import SubscriptionFormFieldDAL from '../DAL/subscriptionFormFieldDAL';
import SelectiveProcess from '../models/selectiveProcess';
import db from '../config/database';
import { QueryResult } from 'pg';
import ProcessDocument from '../models/processDocument';
import SubscriptionFormField from '../models/subscriptionFormField';
import PaginationObject from '../models/paginationObject';
import PaginationService from '../services/paginationService';
import Vacancy from '../models/vacancy';
import ProcessDocumentDAL from '../DAL/processDocumentDAL';

const createSelectiveProcess = async (req: Request, res: Response, next: NextFunction) => {
    const { selectiveProcess } = req.body;

    const sp: SelectiveProcess = selectiveProcess;
    const client = await db.getDbClient();
    let createProcessResult: QueryResult<any> | undefined;

    await client.query('BEGIN');

    try {
        createProcessResult = await SelectiveProcessDAL.createSelectiveProcess(sp.name, sp.collegeId, sp.createdBy, sp.dates, client);

        const processId = createProcessResult?.rows[0].id;

        // Saving vacancy data
        if (sp.vacancies !== undefined) {
            sp.vacancies.forEach(async (vacancy: Vacancy) => {
                vacancy.selectiveProcessId = processId;
                VacancyDAL.createVacancy(vacancy, client);
            });
        }

        // Saving form fields
        if (sp.subscriptionForm !== undefined) {
            sp.subscriptionForm.forEach(async (formField: SubscriptionFormField) => {
                await SubscriptionFormFieldDAL.createSubscriptionFormField(processId, formField, client);
            });
        }

        // Saving documents related to personal information
        if (sp.personalDocuments !== undefined) {
            sp.personalDocuments.forEach(async (document: ProcessDocument) => {
                await ProcessDocumentDAL.createProcessDocumentDAL(processId, document, client);
            });
        }

        // Saving document related to evaluation
        if (sp.evaluatedDocuments !== undefined) {
            sp.evaluatedDocuments.forEach(async (document: ProcessDocument) => {
                await ProcessDocumentDAL.createProcessDocumentDAL(processId, document, client);
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

const getSelectiveProcessesCover = async (req: Request, res: Response, next: NextFunction) => {
    const { collegeId, paginate, page, size, showDeleted } = req.query;
    let selectiveProcesses: SelectiveProcess[] = [];
    let response: PaginationObject = { page: 0, size: 0, pageCount: 0, data: [] };

    try {
        if (collegeId !== undefined)
            selectiveProcesses = await SelectiveProcessDAL.getSelectiveProcessesCoverByCollegeId(parseInt(collegeId as string), showDeleted === 'true');
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
        if (processId !== undefined) {
            selectiveProcessCover = await SelectiveProcessDAL.getSelectiveProcessById(parseInt(processId as string));

            if (selectiveProcessCover !== undefined) {
                response = selectiveProcessCover;

                response.vacancies = await VacancyDAL.getVacanciesByProcessId(parseInt(processId as string));
                response.subscriptionForm = await SubscriptionFormFieldDAL.getSubscriptionFormFieldsByProcessId(parseInt(processId as string));
            }
            
        } else {
            return res.status(400).send('Id do processo seletivo não informado');
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send('Houve um erro ao busca as informações deste processo seletivo');
    }

    return response;
}

const deleteSelectiveProcess = async(req: Request, res: Response, next: NextFunction) => {
    const { id } = req.query;
    const client = await db.getDbClient();

    await client.query('BEGIN');

    try {
        await ProcessDocumentDAL.deleteDocumentsByProcessId(parseInt(id as string), client);
        await SubscriptionFormFieldDAL.deleteSubscriptionFormFieldByProcessId(parseInt(id as string), client);
        await VacancyDAL.deleteVacanciesByProcessId(parseInt(id as string), client);
        await SelectiveProcessDAL.deleteSelectiveProcessById(parseInt(id as string), client);

        await client.query('COMMIT');
    } catch (err: any) {
        console.error(err);
        await client.query('ROLLBACK');
        return res.status(500).send('Houve um erro ao deletar esse docente');
    } finally {
        client.release();
    }

    return res.status(200).send('Processo seletivo deletado');
}

export default { createSelectiveProcess, getSelectiveProcessesCover, getSelectiveProcessFullInformation, deleteSelectiveProcess };