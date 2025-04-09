import ProcessDocument from "./processDocument";

export default interface ProcessDocumentSubmission {
  submittedDocument?: string;
  submittedDocumentExtension?: string;
  processDocument: ProcessDocument;
}
