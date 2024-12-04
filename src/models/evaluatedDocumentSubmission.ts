import ProcessDocument from "./processDocument";

interface EvaluatedFileSubmission {
  file: File;
  accounting?: number;
  startDate?: string;
  endDate?: string;
}

interface EvaluatedDocumentSubmission {
  submitedFiles?: EvaluatedFileSubmission[];
  processDocument: ProcessDocument;
}

export { EvaluatedDocumentSubmission, EvaluatedFileSubmission }