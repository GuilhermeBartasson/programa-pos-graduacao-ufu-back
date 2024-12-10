import Modality from "../enums/modality";
import TargetPublic from "../enums/targetPublic";
import VacancyType from "../enums/vacancyType";
import { EvaluatedDocumentSubmission } from "./evaluatedDocumentSubmission";
import ProcessDocumentSubmission from "./processDocumentSubmission";
import SubscriptionFormFieldAnswer from "./subscriptionFormFieldAnswer";

export default interface SelectiveProcessSubscription {
  id?: number;
  selectiveProcessId: number;
  applicantId: number;
  apllicantEmail: string;
  applicantName: string;
  applicantMiddleName: string;
  applicantLastName: string;
  vacancyType: VacancyType;
  modality: Modality;
  targetPublic: TargetPublic;
  researchLineId: number;
  personalDataForm?: SubscriptionFormFieldAnswer[];
  academicDataForm?: SubscriptionFormFieldAnswer[];
  personalDocuments?: ProcessDocumentSubmission[];
  academicDocuments?: ProcessDocumentSubmission[];
  evaluatedDocuments?: EvaluatedDocumentSubmission[];
}
