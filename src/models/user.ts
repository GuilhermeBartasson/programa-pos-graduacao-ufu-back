export default interface User {
    id: number;
    email: string;
    firstName: string;
    middleName: string;
    lastName: string;
    password: string;
    salt: string;
    role: string;
    active: boolean;
    validated: boolean;
    validationCode?: string;
    validationDate?: string;
    passwordResetCode?: string;
    passwordResetExpiration?: string;
}