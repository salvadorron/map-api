import { PgService } from "../database/pg-config.service";
import { runSeeds } from "../database/seeds";

import fs from 'fs';
import dotenv from 'dotenv';

async function loadEnv() {
    const envFile = '.env';
    if (fs.existsSync(envFile)) {
        const env = dotenv.parse(fs.readFileSync(envFile));
        Object.keys(env).forEach(key => {
            process.env[key] = env[key];
        });
    }
}


async function main() {
    await loadEnv();
    const db = new PgService();
    await db.onModuleInit()
    try {
        await runSeeds(db);
    } catch (error) {
        console.error('Failed to seed the database', error);
        process.exit(1);
    } finally {
        await db.onModuleDestroy();
    }
}

main();