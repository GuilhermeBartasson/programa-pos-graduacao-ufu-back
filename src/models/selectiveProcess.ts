export default interface SelectiveProcess {
    id: number;
    name: string;
    collegeId: number;
    startDate: string;
    endDate: string;
    applicationLimitDate: string;
    homologationDate: string;
    divulgationDate: string;
    active: boolean;
    deleted: boolean;
    status: string;
    createdBy: number;
}