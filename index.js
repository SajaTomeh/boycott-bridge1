//backend/index.js

import 'dotenv/config';
import express from 'express';
import initApp from './src/modules/app.router.js';

const app = express();
const PORT = process.env.PORT || 8000;

initApp(app, express);

app.listen(PORT, (error) => {

    if (error) {
        return console.error(error);
    }
    return console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});


