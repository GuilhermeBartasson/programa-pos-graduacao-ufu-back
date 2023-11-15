import { Request, Response, NextFunction } from 'express';
import DocumentDAL from '../DAL/documentDAL';

const createDocument = async (req: Request, res: Response, next: NextFunction) => {
    const { document } = req.body;

    try {
        await DocumentDAL.createDocument(document);
    } catch (err) {
        console.error(err);

        res.status(500).send('Houve um erro ao criar este documento');
    }

    res.status(201).send('Documento criado com sucesso');
}

export default { createDocument };