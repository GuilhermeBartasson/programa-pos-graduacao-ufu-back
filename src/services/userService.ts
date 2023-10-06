import UserDAL from "../DAL/userDAL";
import User from "../models/user";

class UserService {

    public static userIsValidforSignup(user: User) {
        let valid: boolean = true;

        if (!user.email || user.email.trim() === '') valid = false;
        if (!user.firstName || user.firstName.trim() === '') valid = false;
        if (!user.lastName || user.lastName.trim() === '') valid = false;
        if (!user.password || user.password.trim() === '') valid = false;

        return valid;
    }

    public static async getUserByMail(email: string): Promise<User | undefined> {
        return await UserDAL.getUserByMail(email);
    }

}

export default UserService;