import dotenv from 'dotenv';
import express from 'express';
import connectDB from './db/db.js';

dotenv.config();

const app = express();

connectDB()
.then(() => {
    app.on('error', (error) => {
        console.error('Error occurred:', error);
        throw error;
    });
    
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running on port ${process.env.PORT || 3000}`);
    });
}).catch((error) => {
    console.error('Error connecting to the database:', error);
});



/*

import dotenv from 'dotenv';
import { DB_NAME } from './constants.js';
import mongoose from 'mongoose';
import express from 'express';

dotenv.config();

const app = express();

(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

        app.on('error', (error) => {
            console.error('Error occurred:', error);
        });

        app.listen(process.env.PORT || 3000, () => {
            console.log(`Server is running on port ${process.env.PORT || 3000}`);
        });    

    }
    catch (error) {
        console.error('Error connecting to the database:', error);
        throw error;
    }
})();

*/