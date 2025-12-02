import { Municipality } from "src/entities/municipality.entity";
import { PgService } from "../pg-config.service";

export async function seedMunicipality(db: PgService) {
    console.log('🌱 Seeding Municipalities...');

    const municipalities = [
        {
          id: '03da123b-87b5-49ba-9fd0-eb8932afc68a',
          name: 'Juan Germán Roscio',
          short_name: 'Roscio'
        },
        {
          id: 'fd8fd0fc-4236-49d1-bf88-e01e6d47be53',
          name: 'Francisco de Miranda',
          short_name: 'Miranda'
        },
        {
          id: '951f95c7-3911-4401-ad8f-622380ba0848',
          name: 'Julián Mellado',
          short_name: 'Mellado'
        },
        {
          id: '381b6382-3cd4-4542-8557-dbbb19c3c11e',
          name: 'Ortiz',
          short_name: 'Ortiz'
        },
        {
          id: 'd1aa34f4-2135-45a8-8d88-6764a27fc41a',
          name: 'San Gerónimo de Guayabal',
          short_name: 'Guayabal'
        },
        {
          id: 'cf12548e-6f3d-424f-afa8-7bd2a071041b',
          name: 'Camaguán',
          short_name: 'Camaguán'
        },
        {
          id: '56ea2a05-03bd-43e4-a7c3-81d873e96258',
          name: 'Leonardo Infante',
          short_name: 'Infante'
        },
        {
          id: 'cef94ac5-ee3c-4984-af83-c365fd1774a2',
          name: 'José Félix Ribas',
          short_name: 'Ribas'
        },
        {
          id: 'c22ef3ee-cf46-46fa-9974-7eb05223f7de',
          name: 'El Socorro',
          short_name: 'Socorro'
        },
        {
          id: '52882d34-384b-475a-9ca3-8fadf8909422',
          name: 'Zaraza',
          short_name: 'Zaraza'
        },
        {
          id: 'e2573980-7383-4796-9338-6af5389ed649',
          name: 'Santa María de Ipire',
          short_name: 'Santa María'
        },
        {
          id: 'd740e88f-222c-4501-96e2-7a8b6ce4e4c7',
          name: 'Chaguaramas',
          short_name: 'Chaguaramas'
        },
        {
          id: 'f3726fb9-f041-4e5b-8fbb-c02923aeaef1',
          name: 'Juan José Rondón',
          short_name: 'Rondón'
        },
        {
          id: '9eaa2f25-2237-40bd-91c7-cbd5529df2f9',
          name: 'José Tadeo Monagas',
          short_name: 'Monagas'
        },
        {
          id: '9a3e33c6-5ccc-4108-983d-f3539b11f1a7',
          name: 'San José de Guaribe',
          short_name: 'Guaribe'
        },
      ];


    for (const municipality of municipalities) {
    
        await db.runInTransaction(async (client) => {
            const municipalityId = municipality.id;
            
            const query = `
                INSERT INTO municipalities (id, name, short_name, created_at, updated_at) 
                VALUES ($1, $2, $3, $4, $5)
                
                ON CONFLICT (id) DO UPDATE 
                SET 
                    name = $2,
                    short_name = $3,
                    updated_at = $5
            `;
        
            await client.query<Municipality>(query, [
                municipalityId, 
                municipality.name, 
                municipality.short_name, 
                new Date(),
                new Date()  
            ]);
            
        });
    
    }


    console.log('✅ Municipalities seeded successfully!')
}