import { Parrish } from "src/entities/parrish.entity";
import { PgService } from "../pg-config.service";

export async function seedParrish(db: PgService) {
    console.log('🌱 Seeding Parrishes...');

    const parrishes = [
        {
            "id": "e1bb49b2-dc7a-4e31-a079-0b01029de739",
            "name": "San Juan de los Morros",
            "code": "001",
            "municipality_id": "03da123b-87b5-49ba-9fd0-eb8932afc68a"
        },
        {
            "id": "568d72e6-1239-40e7-9615-8f31e489c77c",
            "code": "001",
            "name": "Cantagallo",
            "municipality_id": "03da123b-87b5-49ba-9fd0-eb8932afc68a"
        },
        {
            "id": "58c3a351-3575-46cb-8f30-fc9209b8f748",
            "code": "001",
            "name": "Parapara",
            "municipality_id": "03da123b-87b5-49ba-9fd0-eb8932afc68a"
        },
        {
            "id": "e6a45b0d-a80b-4920-86ff-f2a1f5437518",
            "code": "002",
            "name": "Chaguaramas",
            "municipality_id": "d740e88f-222c-4501-96e2-7a8b6ce4e4c7"
        },
        {
            "id": "f0f0ba1f-7d60-4f39-a77b-a492de9a93e3",
            "code": "003",
            "name": "Camaguan",
            "municipality_id": "cf12548e-6f3d-424f-afa8-7bd2a071041b"
        },
        {
            "id": "4592e4e2-eee8-42c7-bf08-b15136cb6cd1",
            "code": "003",
            "name": "Puerto Miranda",
            "municipality_id": "cf12548e-6f3d-424f-afa8-7bd2a071041b"
        },
        {
            "id": "ce8f9829-281e-4587-956d-79438fb7df5d",
            "code": "003",
            "name": "Uverito",
            "municipality_id": "cf12548e-6f3d-424f-afa8-7bd2a071041b"
        },
        {
            "id": "133ba7f0-be83-4b65-8743-0c206752b17c",
            "code": "004",
            "name": "El Socorro",
            "municipality_id": "c22ef3ee-cf46-46fa-9974-7eb05223f7de"
        },
        {
            "id": "0d1b5307-eb6b-4c4c-82bd-dea01ccc6c12",
            "code": "005",
            "name": "Calabozo",
            "municipality_id": "fd8fd0fc-4236-49d1-bf88-e01e6d47be53"
        },
        {
            "id": "8a1b1373-a34d-44ad-afa8-6d35ca04c750",
            "code": "005",
            "name": "El Calvario",
            "municipality_id": "fd8fd0fc-4236-49d1-bf88-e01e6d47be53"
        },
        {
            "id": "6be1de7f-feb8-445e-a09e-645ba37ad144",
            "code": "005",
            "name": "El Rastro",
            "municipality_id": "fd8fd0fc-4236-49d1-bf88-e01e6d47be53"
        },
        {
            "id": "b6a8515f-cf50-4736-8b99-380e59f1f846",
            "code": "005",
            "name": "Guardatinajas",
            "municipality_id": "fd8fd0fc-4236-49d1-bf88-e01e6d47be53"
        },
        {
            "id": "28dd8f7d-3e31-4cb9-b4c6-9c4c88e00320",
            "code": "006",
            "name": "Valle de la Pascua",
            "municipality_id": "56ea2a05-03bd-43e4-a7c3-81d873e96258"
        },
        {
            "id": "684f0ade-1161-4f3f-9e23-8d4817144b15",
            "code": "006",
            "name": "Espino",
            "municipality_id": "56ea2a05-03bd-43e4-a7c3-81d873e96258"
        },
        {
            "id": "31e92356-d3a9-46a4-94b2-0bcbbeca6f49",
            "code": "007",
            "name": "Las Mercedes",
            "municipality_id": "f3726fb9-f041-4e5b-8fbb-c02923aeaef1"
        },
        {
            "id": "d0342734-e9d9-4556-995e-67d49bb1f695",
            "code": "007",
            "name": "Cabruta",
            "municipality_id": "f3726fb9-f041-4e5b-8fbb-c02923aeaef1"
        },
        {
            "id": "0eac83ad-1fba-4338-996a-e554ec1d2570",
            "code": "007",
            "name": "Santa Rita de Manapire",
            "municipality_id": "f3726fb9-f041-4e5b-8fbb-c02923aeaef1"
        },
        {
            "id": "d97f403e-2c57-4b43-a563-bbace28c7c6c",
            "code": "008",
            "name": "Tucupido",
            "municipality_id": "cef94ac5-ee3c-4984-af83-c365fd1774a2"
        },
        {
            "id": "3de5754d-9b29-40d0-be3b-e7cd580ea0d5",
            "code": "008",
            "name": "San Rafael de Laya",
            "municipality_id": "cef94ac5-ee3c-4984-af83-c365fd1774a2"
        },
        {
            "id": "83c94366-235b-4d60-bbd8-9d29aa1b1507",
            "code": "009",
            "name": "Altagracia de Orituco",
            "municipality_id": "9eaa2f25-2237-40bd-91c7-cbd5529df2f9"
        },
        {
            "id": "aa5c5231-56a1-450e-bc2b-6baae73c2802",
            "code": "009",
            "name": "Lezama",
            "municipality_id": "9eaa2f25-2237-40bd-91c7-cbd5529df2f9"
        },
        {
            "id": "5d4ef00e-21ce-4e97-ab6f-207c5343623b",
            "name": "Libertad de Orituco",
            "code": "009",
            "municipality_id": "9eaa2f25-2237-40bd-91c7-cbd5529df2f9"
        },
        {
            "id": "7eb749cb-2f58-4f35-a1d4-52fd9ce0e2e8",
            "code": "009",
            "name": "Paso Real de Macaira",
            "municipality_id": "9eaa2f25-2237-40bd-91c7-cbd5529df2f9"
        },
        {
            "id": "3d7126f0-aa59-4395-8189-792691096dcc",
            "code": "009",
            "name": "San Francisco de Macaira",
            "municipality_id": "9eaa2f25-2237-40bd-91c7-cbd5529df2f9"
        },
        {
            "id": "7844dd40-ca26-4161-89fd-0aede8f60393",
            "code": "009",
            "name": "San Rafael de Orituco",
            "municipality_id": "9eaa2f25-2237-40bd-91c7-cbd5529df2f9"
        },
        {
            "id": "8b1202e1-428f-4d07-979e-cb65419596a1",
            "name": "Carlos Soublette",
            "code": "009",
            "municipality_id": "9eaa2f25-2237-40bd-91c7-cbd5529df2f9"
        },
        {
            "id": "7d4d85cc-e7e3-453d-b5b8-e891d12afc56",
            "name": "El Sombrero",
            "code": "010",
            "municipality_id": "951f95c7-3911-4401-ad8f-622380ba0848"
        },
        {
            "id": "d684b6ee-810d-44ef-8d25-0c04eccbf8b9",
            "name": "Sosa",
            "code": "010",
            "municipality_id": "951f95c7-3911-4401-ad8f-622380ba0848"
        },
        {
            "id": "9f921296-b1bd-4e72-94ee-95912e1e2327",
            "name": "San Francisco de Tiznados",
            "code": "011",
            "municipality_id": "381b6382-3cd4-4542-8557-dbbb19c3c11e"
        },
        {
            "id": "4da79c21-a73b-4387-acdc-e71f703bcf6f",
            "code": "011",
            "name": "San Jose de Tiznados",
            "municipality_id": "381b6382-3cd4-4542-8557-dbbb19c3c11e"
        },
        {
            "id": "eae109a8-bb44-4d33-a3c4-8b4f63d0e5fb",
            "code": "011",
            "name": "San Lorenzo de Tiznados",
            "municipality_id": "381b6382-3cd4-4542-8557-dbbb19c3c11e"
        },
        {
            "id": "4b83e5c7-bfda-4b9b-afa3-bf0d6529c5ba",
            "code": "011",
            "name": "Ortiz",
            "municipality_id": "381b6382-3cd4-4542-8557-dbbb19c3c11e"
        },
        {
            "id": "5f34ee34-865d-42b7-81de-ae5fc2623c2c",
            "code": "012",
            "name": "Guayabal",
            "municipality_id": "d1aa34f4-2135-45a8-8d88-6764a27fc41a"
        },
        {
            "id": "0e95488c-b71d-471c-91a4-3254d4ed4661",
            "code": "012",
            "name": "Cazorla",
            "municipality_id": "d1aa34f4-2135-45a8-8d88-6764a27fc41a"
        },
        {
            "id": "84e5d448-3556-44c6-91c6-f37434aa25c7",
            "code": "013",
            "name": "San José de Guaribe",
            "municipality_id": "9a3e33c6-5ccc-4108-983d-f3539b11f1a7"
        },
        {
            "id": "1fe3ea9b-9b36-43a8-88a2-96bd9290be92",
            "code": "014",
            "name": "Santa María de Ipire",
            "municipality_id": "e2573980-7383-4796-9338-6af5389ed649"
        },
        {
            "id": "e84f723a-27ee-432d-a150-db0a2fdbf398",
            "name": "Altamira",
            "code": "014",
            "municipality_id": "e2573980-7383-4796-9338-6af5389ed649"
        },
        {
            "id": "2d5a6ccf-c9d0-4f37-9b7d-186483c1118d",
            "code": "015",
            "name": "Zaraza",
            "municipality_id": "52882d34-384b-475a-9ca3-8fadf8909422"
        },
        {
            "id": "b2fcaf5e-9f70-46b3-831e-c96fd333f586",
            "name": "San José de Unare",
            "code": "015",
            "municipality_id": "52882d34-384b-475a-9ca3-8fadf8909422"
        }
    ]

    for (const parrish of parrishes) {

        await db.runInTransaction(async (client) => {

            const query = `
                INSERT INTO parrishes (id, name, code, municipality_id, created_at, updated_at) 
                VALUES ($1, $2, $3, $4, $5, $6)
                
                ON CONFLICT (id) DO UPDATE 
                SET 
                    name = $2,
                    code = $3,
                    municipality_id = $4,
                    updated_at = $6
            `;

            await client.query<Parrish>(query, [
                parrish.id,
                parrish.name,
                parrish.code,
                parrish.municipality_id,
                new Date(),
                new Date()
            ]);

        });

    }


    console.log('✅ Parrishes seeded successfully!')
}