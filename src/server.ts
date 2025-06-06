import http from 'http';
import express, { Express } from 'express';
import morgan from 'morgan';
import routes from './routes/rootRouter';
import config from './config/default.json';
import 'dotenv/config';

const router: Express = express();

// Logging
router.use(morgan('dev'));
// Parsing the request
router.use(express.urlencoded({ extended: false }));
// parsing json data
router.use(express.json());

router.use((req, res, next) => {
    // CORS policy
    res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
    // CORS headers
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    // CORS method headers
    res.header('Access-Control-Allow-Methods', 'GET, PATCH, DELETE, POST, OPTIONS, PUT');

    if (req.method === 'OPTIONS') res.sendStatus(204);
    else next();
});

router.use('/', routes);

// Error handling
router.use((req, res, next) => {
    const error = new Error('not found');
    return res.status(404).json({
        message: error.message
    });
});

// Server
const httpServer = http.createServer(router);
const PORT:any = process.env.PORT || config.server.port;
httpServer.listen(PORT, () => console.log(`Server running on port ${ PORT }`));
