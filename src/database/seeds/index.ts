import { PgService } from '../pg-config.service';
import { seedInstitutions } from './institution.seed';
import { seedMunicipality } from './municipality.seed';
import { seedParrish } from './parrish.seed';

export async function runSeeds(db: PgService) {
  console.log('🚀 Starting database seeding...');

  try {
    await seedMunicipality(db);
    await seedParrish(db);
    await seedInstitutions(db);
    console.log('🎉 All seeds completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding: ', error);
    throw error;
  }
}
