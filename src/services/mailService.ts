import * as nodemailer from "nodemailer";
import config from '../config/default.json';
import Mail from "nodemailer/lib/mailer";

class MailService {

    public static sendMail(to: string, subject: string, message: string): Promise<any> {

        let mailOptions: Mail.Options = {
            from: "guilhermebnj@gmail.com",
            to,
            subject,
            html: message
        };

        const transporter: nodemailer.Transporter = nodemailer.createTransport({
            service: config.mail.service,
            auth: {
                user: config.mail.user,
                pass: process.env.EMAIL_PASSWORD
            }
        });


        return new Promise<any>((resolve, reject) => {
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(info);
                }
            })
        })

    }

}

export default MailService;