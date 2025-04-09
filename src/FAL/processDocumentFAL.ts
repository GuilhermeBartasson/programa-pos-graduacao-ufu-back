import College from "../models/college";
import * as fs from 'fs';
import * as path from 'path';
import config from '../config/default.json';
import ProcessDocumentSubmission from "../models/processDocumentSubmission";
import CollegeDAL from "../DAL/collegeDAL";
import { EvaluatedDocumentFilePathWrapper, EvaluatedDocumentSubmission, EvaluatedFileSubmission } from "../models/evaluatedDocumentSubmission";

export default class ProcessDocumentFAL {

    public static async writeProcessDocumentSubmission(
        processId: number, processName: string, applicantFullName: string, documentSubmission: ProcessDocumentSubmission
    ): Promise<string> {
        let path: string | undefined;

        try {
            if (documentSubmission.submittedDocument === undefined) throw 'Nenhum documento foi fornecido';

            const college: College | undefined = await CollegeDAL.getCollegeByProcessId(processId);
            const documentName: string = documentSubmission.processDocument.name;
            const extension: string | undefined = documentSubmission.submittedDocumentExtension;
            const filePath: string = `${config.files.basePath}${college?.name}/${processName}/Inscricoes/${applicantFullName}/Documentos/`;

            if (extension === undefined) throw 'Não foi possível identificar a extensão do arquivo';

            if (!fs.existsSync(filePath)) fs.mkdirSync(filePath, { recursive: true });

            path = `${filePath}${documentName}.${extension}`;

            let buffer = Buffer.from(documentSubmission.submittedDocument, 'base64');

            fs.writeFileSync(path, buffer);
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