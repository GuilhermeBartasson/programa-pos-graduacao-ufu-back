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

    try {
        await client.query('BEGIN');

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
                await ProcessDocumentDAL.createProcessDocument(processId, document, client);
            });
        }

        // Saving document related to evaluation
        if (sp.evaluatedDocuments !== undefined) {
            sp.evaluatedDocuments.forEach(async (document: ProcessDocument) => {
                await ProcessDocumentDAL.createProcessDocument(processId, document, client);
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

    try {
        if (processId !== undefined) {
            response = await SelectiveProcessDAL.getSelectiveProcessById(parseInt(processId as string));

            if (response !== undefined) {
                response.vacancies = await VacancyDAL.getVacanciesByProcessId(parseInt(processId as string));
                response.subscriptionForm = await SubscriptionFormFieldDAL.getSubscriptionFormFieldsByProcessId(parseInt(processId as string));

                let processDocuments: ProcessDocument[] = await ProcessDocumentDAL.getDocumentsByProcessId(parseInt(processId as string));

                response.personalDocuments = processDocuments.filter((document: ProcessDocument) => document.evaluated === false);
                response.evaluatedDocuments = processDocuments.filter((document: ProcessDocument) => document.evaluated === true);
            }
            
        } else {
            return res.status(400).send('Id do processo seletivo não informado');
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send('Houve um erro ao busca as informações deste processo seletivo');
    }

    res.status(200).send(response);
}

const deleteSelectiveProcess = async(req: Request, res: Response, next: NextFunction) => {
    const { id } = req.query;
    const client = await db.getDbClient();

    await client.query('BEGIN');

    try {
        await ProcessDocumentDAL.deleteDocumentsByProcessId(parseInt(id as string), client);
        await SubscriptionFormFieldDAL.deleteSubscriptionFormFieldsByProcessId(parseInt(id as string), client);
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

const updateSelectiveProcess = async(req: Request, res: Response, next: NextFunction) => {
    const { selectiveProcess } = req.body;

    const sp: SelectiveProcess = selectiveProcess;
    const client = await db.getDbClient();

    try {
        await client.query('BEGIN');

        await SelectiveProcessDAL.saveSelectiveProcessCover(sp, client).then(result => {
            if (result === undefined || result.rowCount === 0) throw 'Processo seletivo não encontrado';
        }).catch(err => {
            throw err;
        });

        // Updating Vacacny Data
        await VacancyDAL.deleteVacanciesByProcessId(sp.id, client);
        sp.vacancies?.forEach(async (vacancy: Vacancy) => {
            if (vacancy.selectiveProcessId === undefined) vacancy.selectiveProcessId = sp.id;
            await VacancyDAL.createVacancy(vacancy, client)
        });

        // Updating Subscription Form Data
        await SubscriptionFormFieldDAL.deleteSubscriptionFormFieldsByProcessId(sp.id, client);
        sp.subscriptionForm?.forEach(async (formField: SubscriptionFormField) => {
            await SubscriptionFormFieldDAL.createSubscriptionFormField(sp.id, formField, client);
        });

        // Updating Documents Data
        await ProcessDocumentDAL.deleteDocumentsByProcessId(sp.id, client);
        sp.personalDocuments?.forEach(async (document: ProcessDocument) => {
            await ProcessDocumentDAL.createProcessDocument(sp.id, document, client);
        });
        sp.evaluatedDocuments?.forEach(async (document: ProcessDocument) => {
            await ProcessDocumentDAL.createProcessDocument(sp.id, document, client);
        })

        await client.query('COMMIT');
    } catch (err) {
        console.error(err);
        await client.query('ROLLBACK');
        return res.status(500).send('Houve um erro ao salvar esse processo seletivo');
    } finally {
        client.release();
    }

    return res.status(200).send('Processo seletivo salvo com sucesso');
}

export default { createSelectiveProcess, getSelectiveProcessesCover, getSelectiveProcessFullInformation, deleteSelectiveProcess, updateSelectiveProcess };