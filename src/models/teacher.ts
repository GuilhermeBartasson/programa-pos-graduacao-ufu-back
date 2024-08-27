export default interface Teacher {
    id?: number;
    name: string;
    collegeId: number;
    personalPageLink: string;
    email: string;
    active?: boolean;
    deleted?: boolean;
}