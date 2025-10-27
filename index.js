import 'dotenv/config'; 
import mongodb from './db/mongo.js';
import sql from './db/sql.js';

(async () => {
    try {
        await mongodb();
        
        const conn = await sql.getConnection();
        console.log("MySQL connected");
        conn.release();

    } catch (err) {
        console.error("Database initialization failed:", err);
        process.exit(1);
    }
})();