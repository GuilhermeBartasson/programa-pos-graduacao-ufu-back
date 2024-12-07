import College from "../models/college";
import * as fs from 'fs';
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
            if (documentSubmission.submitedDocument === undefined) throw 'Nenhum documento foi fornecido';

            const college: College | undefined = await CollegeDAL.getCollegeByProcessId(processId);
            const documentName: string = documentSubmission.processDocument.name;
            const extension: string | undefined = documentSubmission.submitedDocument?.name.split('.').pop();
            const filePath: string = `${config.files.basePath}${college?.name}/${processName}/Inscricoes/${applicantFullName}/Documentos/`;
            if (!fs.existsSync(filePath)) fs.mkdirSync(filePath, { recursive: true });

            if (extension === undefined) throw 'Não foi possível identificar a extensão do arquivo';

            path = `${filePath}${documentName}.${extension}`;
            const arrayBuffer: ArrayBuffer = await documentSubmission.submitedDocument.arrayBuffer();

            let buffer = Buffer.from(arrayBuffer);

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

        try {
            if (evaluatedDocumentSubmission.submitedFiles === undefined) throw 'Nenhum documento foi fornecido';
            
            evaluatedDocumentSubmission.submitedFiles.forEach((fileSubmission: EvaluatedFileSubmission, index: number) => {
                if (fileSubmission.file === undefined) throw `Documento de número ${index + 1} fornecido para o documento ${evaluatedDocumentSubmission.processDocument.name} está indefinido!`;
            });

            const college: College | undefined = await CollegeDAL.getCollegeByProcessId(processId);
            const documentName: string = evaluatedDocumentSubmission.processDocument.name;

            const filePath: string = `${config.files.basePath}${college?.name}/${processName}/Inscricoes/${applicantFullName}/Documentos Avaliativos/`;
            if (!fs.existsSync(filePath)) fs.mkdirSync(filePath, { recursive: true });

            evaluatedDocumentSubmission.submitedFiles.forEach(async (submittedFile: EvaluatedFileSubmission, index: number) => {
                const extension: string | undefined = submittedFile.file.name.split('.').pop();

                if (extension === undefined) throw `${documentName} - não foi possível indentificar a extensão do arquivo de número ${index + 1}`;

                const path: string = `${filePath}${documentName}_${index + 1}.${extension}`;
                const arrayBuffer: ArrayBuffer = await submittedFile.file.arrayBuffer();

                let buffer = Buffer.from(arrayBuffer);

                fs.writeFileSync(path, buffer);

                documentPaths.push({ filePath: path, index: index + 1 });
            });
        } catch (err) {
            throw err;
        }

        return documentPaths;
    }

    public static async getProcessDocumentSubmission(filePath: string): Promise<File | undefined> {
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

}