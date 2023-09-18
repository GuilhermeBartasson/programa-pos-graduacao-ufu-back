import { Request, Response, NextFunction } from "express";
import MailService from "../../services/mailService";

const sendMail = async (req: Request, res: Response, next: NextFunction) => {
    const { to, subject, message } = req.body;

    await MailService.sendMail(to, subject, message).then(info => {
        console.log(info);
        res.status(200).send({ message: 'Email enviado com sucesso'  });
    }, err => {
        console.error(err);
        res.status(500).send({ message: 'Ocorreu um erro ao enviar o email', err });
    });
}

export default { sendMail };