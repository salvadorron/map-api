import { Controller, Get } from '@nestjs/common';
import { PgService } from 'src/database/pg-config.service';
import { HealthCheck, HealthCheckService, HealthIndicatorResult } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
    constructor(readonly pgService: PgService, private health: HealthCheckService) { }

    @Get()
    @HealthCheck()
    async check() {
        return this.health.check([() => this.checkDatabaseConnection(), () => this.checkPostgisConnection()]);
    }
    async checkDatabaseConnection(): Promise<HealthIndicatorResult> {
        try {
            const result = await this.pgService.query('SELECT 1');
            if (!result) {
                return {
                    database: {
                        status: 'down',
                    },
                };
            }
            return { database: { status: 'up' } }
        } catch (error) {
            console.error('Error al conectar a PostgreSQL: ', error);
            return {
                database: {
                    status: 'down',
                },
            };
        }
    }

    async checkPostgisConnection(): Promise<HealthIndicatorResult> {
        try {
            const result = await this.pgService.query('SELECT postgis_full_version()');
            if (!result) {
                return {
                    postgis: {
                        status: 'down',
                    },
                };
            }
            return { postgis: { status: 'up' } }
        } catch (error) {
            console.error('Error al conectar a PostGIS: ', error);
            return {
                postgis: {
                    status: 'down',
                },
            };
        }
    }
}
