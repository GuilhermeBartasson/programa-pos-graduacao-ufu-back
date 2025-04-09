import ProcessDocument from "./processDocument";

interface EvaluatedFileSubmission {
  file: string;
  extension?: string;
  accounting?: number;
  startDate?: string;
  endDate?: string;
}

interface EvaluatedDocumentSubmission {
  submitedFiles?: EvaluatedFileSubmission[];
  processDocument: ProcessDocument;
}

interface EvaluatedDocumentFilePathWrapper {
  filePath: string;
  index: number;
}

export { EvaluatedDocumentSubmission, EvaluatedFileSubmission, EvaluatedDocumentFilePathWrapper }