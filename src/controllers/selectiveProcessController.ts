import { Request, Response, NextFunction } from 'express';
import SelectiveProcessDAL from '../DAL/selectiveProcessDAL';
import VacancyDAL from '../DAL/vacancyDAL';
import SubscriptionFormFieldDAL from '../DAL/subscriptionFormFieldDAL';
import SelectiveProcess from '../models/selectiveProcess';
import db from '../config/database';
import { PoolClient, QueryResult } from 'pg';
import ProcessDocument from '../models/processDocument';
import PaginationObject from '../models/paginationObject';
import PaginationService from '../services/paginationService';
import ProcessDocumentDAL from '../DAL/processDocumentDAL';
import SelectiveProcessSubscription from '../models/selectiveProcessSubscription';
import SubscriptionFormFieldAnswer from '../models/subscriptionFormFieldAnswer';

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
            for (let vacancy of sp.vacancies) {
                vacancy.selectiveProcessId = processId;
                await VacancyDAL.createVacancy(vacancy, client);
            }
        }

        // Saving form fields
        if (sp.subscriptionForm !== undefined) {
            for (let formField of sp.subscriptionForm) {
                await SubscriptionFormFieldDAL.createSubscriptionFormField(processId, formField, client);
            }
        }

        // Saving documents related to personal information
        if (sp.personalDocuments !== undefined) {
            for (let document of sp.personalDocuments) {
                await ProcessDocumentDAL.createProcessDocument(processId, document, client);
            }
        }

        // Saving documents related to evaluation
        if (sp.evaluatedDocuments !== undefined) {
            for (let document of sp.evaluatedDocuments) {
                await ProcessDocumentDAL.createProcessDocument(processId, document, client);
            }
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
        if (sp.vacancies !== undefined) {
            for (let vacancy of sp.vacancies) {
                if (vacancy.selectiveProcessId === undefined) vacancy.selectiveProcessId = sp.id;
                await VacancyDAL.createVacancy(vacancy, client)
            }
        }

        // Updating Subscription Form Data
        await SubscriptionFormFieldDAL.deleteSubscriptionFormFieldsByProcessId(sp.id, client);
        if (sp.subscriptionForm !== undefined) {
            for (let formField of sp.subscriptionForm) {
                await SubscriptionFormFieldDAL.createSubscriptionFormField(sp.id, formField, client);
            }
        }

        // Updating Documents Data
        await ProcessDocumentDAL.deleteDocumentsByProcessId(sp.id, client);
        if (sp.personalDocuments !== undefined) {
            for (let document of sp.personalDocuments) {
                await ProcessDocumentDAL.createProcessDocument(sp.id, document, client);
            }
        }
        if (sp.evaluatedDocuments !== undefined) {
            for (let document of sp.evaluatedDocuments) {
                await ProcessDocumentDAL.createProcessDocument(sp.id, document, client);
            }
        }

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

const saveSubscriptionInformation = async(req: Request, res: Response, next: NextFunction) => {
    const { selectiveProcessSubscription } = req.body;

    const sub: SelectiveProcessSubscription = selectiveProcessSubscription;
    const client: PoolClient = await db.getDbClient();

    let createProcessResult: QueryResult<any> | undefined;

    try {
        await client.query('BEGIN');

        if (sub.id === undefined) {
            createProcessResult = await SelectiveProcessDAL.createSelectiveProcessSubscription(
                sub.selectiveProcessId, 
                sub.apllicantEmail, 
                sub.modality, 
                sub.vacancyType, 
                sub.targetPublic, 
                sub.researchLineId, 
                client
            );

            sub.id = createProcessResult?.rows[0].id;
        } else {
            await SelectiveProcessDAL.updateSelectiveProcessSubscription(sub.id, sub.modality, sub.vacancyType, sub.targetPublic, sub.researchLineId, client);
        }

        if (sub.id === undefined) throw 'Não foi possível identificar o id da inscrição';
        
        await SubscriptionFormFieldDAL.deleteSubscriptionFormFieldAnswersBySubscriptionId(sub.id, client);

        // Saving personal data
        if (sub.personalDataForm !== undefined) {
            for (let answer of sub.personalDataForm) {
                await SubscriptionFormFieldDAL.createFormFieldAnswer(sub.id, answer, client);
            }
        }

        // Saving academic data
        if (sub.academicDataForm !== undefined) {
            for (let answer of sub.academicDataForm) {
                await SubscriptionFormFieldDAL.createFormFieldAnswer(sub.id, answer, client);
            }
        }

    } catch (err) {
        console.error(err);
        await client.query('ROLLBACK');
        return res.status(500).send('Houve um erro ao salvar a inscrição');
    } finally {
        client.release();
    }

    res.status(200).send('Inscrição salva com sucesso');
}

export default { 
    createSelectiveProcess, 
    getSelectiveProcessesCover, 
    getSelectiveProcessFullInformation, 
    deleteSelectiveProcess, 
    updateSelectiveProcess, 
    saveSubscriptionInformation 
};