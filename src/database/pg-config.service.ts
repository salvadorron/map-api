import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Pool, QueryResult, PoolClient } from 'pg';

@Injectable()
export class PgService implements OnModuleInit, OnModuleDestroy {
    private pool: Pool;
    async onModuleInit() {
        const user = process.env.DB_USER;
        const host = process.env.DB_HOST;
        const database = process.env.DB_NAME;
        const password = process.env.DB_PASSWORD;
        const port = parseInt(process.env.DB_PORT ?? '5432', 10);


        this.pool = new Pool({
            user,
            host,
            database,
            password,
            port
        })

        try {
            await this.pool.query('SELECT NOW()');
            console.log('Conexión a PostgreSQL establecida correctamente. ');

        } catch (error) {
            console.error('Error al conectar a PostgreSQL: ', error);
            throw error
        }


    }

    query(text: string, params?: any[]): Promise<QueryResult> {
        return this.pool.query(text, params);
    }

    async runInTransaction<T>(executeTransaction: (client: PoolClient) => Promise<T>): Promise<T> {
        const client = await this.pool.connect();

        try {
            await client.query('BEGIN');

            const result = await executeTransaction(client);

            await client.query('COMMIT');

            return result;

        } catch (error) {
            await client.query('ROLLBACK');
            throw error

        } finally {
            client.release()
        }
    }

    async onModuleDestroy() {
        await this.pool.end();
    }

}