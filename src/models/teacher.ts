export default interface Teacher {
    id: number;
    name: string;
    personalPageLink: string;
    email: string;
    active?: boolean;
    deleted?: boolean;
}