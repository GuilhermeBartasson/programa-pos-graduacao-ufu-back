import AccountingType from "../enums/accountingType";
import Modality from "../enums/modality";
import VacancyType from "../enums/vacancyType";

export default interface ProcessDocument {
    id: number;
    processId: number;
    name: string;
    description: string;
    stage: string;
    modality: Modality;
    vacancyType: VacancyType;
    accountingType: AccountingType;
    accountingValue: number;
    allowMultipleSubmissions: boolean;
    deleted: boolean;
}