import College from "../models/college";
import * as fs from 'fs';
import config from '../config/default.json';
import ProcessDocumentSubmission from "../models/processDocumentSubmission";
import CollegeDAL from "../DAL/collegeDAL";

export default class ProcessDocumentFAL {

    public static async writeProcessDocumentSubmission(
        processId: number, processName: string, applicantFullName: string, documentSubmission: ProcessDocumentSubmission
    ): Promise<void> {
        try {
            if (documentSubmission.submitedDocument === undefined) throw 'Nenhum documento foi fornecido';

            const college: College | undefined = await CollegeDAL.getCollegeByProcessId(processId);
            const documentName: string = documentSubmission.processDocument.name;
            const extension: string | undefined = documentSubmission.submitedDocument?.name.split('.').pop();
        
            if (extension === undefined) throw 'Não foi possível identificar a extensão do arquivo';

            const path: string = `${config.files.basePath}${college?.name}/${processName}/Inscricoes/${applicantFullName}/Documentos/${documentName}.${extension}`;
            const arrayBuffer: ArrayBuffer = await documentSubmission.submitedDocument.arrayBuffer();

            let buffer = Buffer.from(arrayBuffer);

            fs.writeFileSync(path, buffer);
        } catch (err) {
            throw err;
        }
    }

}