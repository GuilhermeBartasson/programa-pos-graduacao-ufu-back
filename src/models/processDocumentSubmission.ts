import ProcessDocument from "./processDocument";

export default interface ProcessDocumentSubmission {
  submitedDocument?: File;
  processDocument: ProcessDocument;
}
