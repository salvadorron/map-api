import { PgService } from "src/database/pg-config.service";

async function main() {
    const db = new PgService();
    try {
        await runSeed(db);
    } catch (error) {
        console.error('Failed to seed the database', error);
        process.exit(1);
    }
    finally {
        await db.onModuleDestroy();
    }
}

main();