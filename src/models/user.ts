interface User {
    id: number;
    email: string;
    firstname: string;
    middlename: string;
    lastname: string;
    password: string;
    salt: string;
    role: string;
    active: boolean;
    validated: boolean;
    validationcode?: string;
    validationdate?: string;
    passwordresetcode?: string;
    passwordresetexpiration?: string;
}

export default User;