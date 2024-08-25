import ProcessDocument from "./processDocument";
import ResearchLineDoctorateVacancy from "./researchLineDoctorateVacancy";
import ResearchLineMastersVacancy from "./researchLineMastersVacancy";
import SelectiveProcessDates from "./selectiveProcessDates";
import SubscriptionFormField from "./subscriptionFormField";

export default interface SelectiveProcess {
    id: number;
    name: string;
    dates: SelectiveProcessDates;
    mastersVacancy?: ResearchLineMastersVacancy[];
    doctorateVacancy?: ResearchLineDoctorateVacancy[];
    subscriptionForm?: SubscriptionFormField[];
    personalDocuments?: ProcessDocument[];
    evaluatedDocuments?: ProcessDocument[];
    collegeId: number;
    active: boolean;
    deleted: boolean;
    status: string;
    createdBy: number;
}