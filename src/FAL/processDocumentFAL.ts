import College from "../models/college";
import * as fs from 'fs';
import * as path from 'path';
import config from '../config/default.json';
import CollegeDAL from "../DAL/collegeDAL";
import { EvaluatedDocumentFilePathWrapper, EvaluatedDocumentSubmission } from "../models/evaluatedDocumentSubmission";
import ProcessDocument from "../models/processDocument";
import Stages from "../enums/stages";
import ProcessDocumentDAL from "../DAL/processDocumentDAL";

export default class ProcessDocumentFAL {

    public static async writeProcessDocumentSubmission(
        processId: number, 
        subscriptionId: number,
        processName: string, 
        applicantFullName: string, 
        file: Express.Multer.File, 
        extension: string,
        processDocument: ProcessDocument,
        fileCount?: number
    ): Promise<string> {
        let path: string | undefined;

        try {
            if (file === undefined) throw 'Nenhum documento foi fornecido';

            const college: College | undefined = await CollegeDAL.getCollegeByProcessId(processId);

            const filePath: string = `${config.files.basePath}${college?.name}/${processName}/${applicantFullName}/${Stages[processDocument.stage]}/`;

            if (extension === undefined) throw 'Não foi possível identificar a extensão do arquivo';

            if (!fs.existsSync(filePath)) fs.mkdirSync(filePath, { recursive: true });

            path = `${filePath}${processDocument.name}${fileCount !== undefined ? `_${fileCount}` : ''}.${extension}`;

            let buffer = new Uint8Array(file.buffer);

            fs.writeFileSync(path, buffer);

            if ([Stages.PersonalData, Stages.AcademicData].includes(processDocument.stage))
                await ProcessDocumentDAL.updateProcessDocumentSubmissionFilePath(processId, subscriptionId, processDocument.id, path);
            else
                await ProcessDocumentDAL.updateProcessDocumentEvaluatedSubmissionFilePath(processId, subscriptionId, processDocument.id, path, fileCount!);
        } catch (err) {
            throw err;
        }

        return path;
    }

    public static async writeProcessDocumentEvaluatedSubmission(
        processId: number, processName: string, applicantFullName: string, evaluatedDocumentSubmission: EvaluatedDocumentSubmission
    ): Promise<EvaluatedDocumentFilePathWrapper[]> {
        let documentPaths: EvaluatedDocumentFilePathWrapper[] = [];
        let index: number = 0;

        try {
            if (evaluatedDocumentSubmission.submitedFiles === undefined) throw 'Nenhum documento foi fornecido';
            
            for (const fileSubmission of evaluatedDocumentSubmission.submitedFiles) {
                if (fileSubmission.file === undefined) {
                    throw `Documento de número ${index + 1} fornecido para o documento ${evaluatedDocumentSubmission.processDocument.name} está indefinido!`;
                }
                index += 1;
            }

            const college: College | undefined = await CollegeDAL.getCollegeByProcessId(processId);
            const documentName: string = evaluatedDocumentSubmission.processDocument.name;
            const filePath: string = `${config.files.basePath}${college?.name}/${processName}/Inscricoes/${applicantFullName}/Documentos Avaliativos/`;

            if (!fs.existsSync(filePath)) fs.mkdirSync(filePath, { recursive: true });

            index = 0;
            for (const submittedFile of evaluatedDocumentSubmission.submitedFiles) {
                const extension: string | undefined = submittedFile.extension;

                if (extension === undefined) throw `${documentName} - não foi possível indentificar a extensão do arquivo de número ${index + 1}`;

                const path: string = `${filePath}${documentName}_${index + 1}.${extension}`;

                let buffer = Buffer.from(submittedFile.file, 'base64');

                fs.writeFileSync(path, buffer);

                documentPaths.push({ filePath: path, index: index + 1 });

                index += 1;
            }
        } catch (err) {
            throw err;
        }

        return documentPaths;
    }

    public static getProcessDocumentSubmission(filePath: string): File | undefined {
        let response: File | undefined;

        try {
            if (!fs.existsSync(filePath)) throw 'Documento não encontrado';

            let buffer: Buffer = fs.readFileSync(filePath);
            let documentName: string | undefined = filePath.split('/').pop();

            if (documentName === undefined) throw 'Não foi possível obter o nome do documento';

            response = new File([buffer], documentName);
        } catch (err) {
            throw err;
        }

        return response;
    }

    public static deleteProcessDocumentSubmission(filePath: string): void {
        try {
            if (!fs.existsSync(filePath)) throw 'Documento não encontrado';

            fs.rmSync(filePath);
        } catch (err) {
            throw err;
        }
    }

    public static async deleteApplicantDocuments(processId: number, processName: string, applicantFullName: string): Promise<void> {
        try {
            const college: College | undefined = await CollegeDAL.getCollegeByProcessId(processId);
            const documentsPath: string = `${config.files.basePath}${college?.name}/${processName}/Inscricoes/${applicantFullName}/Documentos/`;
        
            const files: string[] = fs.existsSync(documentsPath) ? fs.readdirSync(documentsPath) : [];

            for (const file of files) {
                fs.unlinkSync(path.join(documentsPath, file));
            }
        } catch (err) {
            throw err;
        }
    }

    public static async deleteApplicantEvaluatedDocuments(processId: number, processName: string, applicantFullName: string): Promise<void> {
        try {
            const college: College | undefined = await CollegeDAL.getCollegeByProcessId(processId);
            const documentsPath: string = `${config.files.basePath}${college?.name}/${processName}/Inscricoes/${applicantFullName}/Documentos Avaliativos/`;
        
            const files: string[] = fs.readdirSync(documentsPath);

            for (const file of files) {
                fs.unlinkSync(path.join(documentsPath, file));
            }
        } catch (err) {
            throw err;
        }
    }

}