import ProcessDocument from "./processDocument";
import SelectiveProcessDates from "./selectiveProcessDates";
import SubscriptionFormField from "./subscriptionFormField";
import Vacancy from "./vacancy";

export default interface SelectiveProcess {
    id: number;
    name: string;
    dates: SelectiveProcessDates;
    vacancies?: Vacancy[];
    subscriptionForm?: SubscriptionFormField[];
    personalDocuments?: ProcessDocument[];
    evaluatedDocuments?: ProcessDocument[];
    collegeId: number;
    active: boolean;
    deleted: boolean;
    status: string;
    createdBy: number;
}