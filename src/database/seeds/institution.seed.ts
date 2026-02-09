import { Municipality } from "src/entities/municipality.entity";
import { PgService } from "../pg-config.service";

export async function seedInstitutions(db: PgService) {
    console.log('🌱 Seeding Institutions...');

    const institutions = [
        {
            "code": "01-00",
            "name": "SECRETARÍA GENERAL DE GOBIERNO",
            "id": "aff90022-5495-43e3-9859-ae48ad1b042e"
        },
        {
            "code": "01-3",
            "name": "DIRECCIÓN GENERAL DE TALENTO HUMANO",
            "id": "1a3f2690-dcd6-472c-81a8-faa8a63ca0d7"
        },
        {
            "code": "01-5",
            "name": "DIRECCIÓN DE ARCHIVO CENTRAL",
            "id": "48062789-fbdc-4302-b675-3303624c4a78"
        },
        {
            "code": "02-00",
            "name": "SECRETARÍA DE FINANZAS",
            "id": "ed99f240-61c6-4a5e-9417-b79fcf48437f"
        },
        {
            "code": "03-00",
            "name": "SECRETARÍA DE PLANIFICACIÓN Y PRESUPUESTO",
            "id": "f2c68598-45e7-4d8f-b20c-f1ceda3de5ad"
        },
        {
            "code": "04-00",
            "name": "SECRETARÍA DE OBRAS PÚBLICAS",
            "id": "66530820-e5f6-4f09-a275-6c50790946da"
        },
        {
            "code": "05-00",
            "name": "SECRETARÍA DE PROTECCIÓN SOCIAL",
            "id": "de722213-369f-45ec-ba69-174bb9901a9d"
        },
        {
            "code": "06-00",
            "name": "SECRETARÍA DE PRODUCCIÓN Y COMERCIO",
            "id": "8f7c0e1e-f153-46e7-8eec-cad40db98bb5"
        },
        {
            "code": "07-00",
            "name": "SECRETARÍA DE EDUCACIÓN, CULTURA Y DEPORTE",
            "id": "332bf81f-c437-4c08-88f9-7588a140dd48"
        },
        {
            "code": "08-00",
            "name": "SECRETARÍA DE SALUD PÚBLICA",
            "id": "b7d90a53-0025-4256-b698-4b447933a961"
        },
        {
            "code": "09-00",
            "name": "SECRETARÍA DE EDUCACION UNIVERSITARIA",
            "id": "a3c618a0-4c31-4dc5-8b71-171d579af751"
        },
        {
            "code": "10-00",
            "name": "SECRETARÍA SEGURIDAD Y DEFENSA CIUDADANA",
            "id": "72e5b41b-0043-4e55-b899-def55c0ec036"
        },
        {
            "code": "10-8",
            "name": "CUERPO DE BOMBEROS DEL ESTADO BOLIVARIANO DE GUÁRICO",
            "id": "68be5e9e-dd2f-40df-bbcd-949527e7fcc7"
        },
        {
            "code": "10-9",
            "name": "DIRECCIÓN ESTADAL DE PROTECCIÓN CIVIL Y ADMIN. DE DESASTRES",
            "id": "a10071e9-7b79-4aba-82ce-b351fc2717eb"
        },
        {
            "code": "11-00",
            "name": "SECRETARÍA DE GESTIÓN TERRITORIAL",
            "id": "4a612b26-5957-485d-95d2-cb2d3370c877"
        },
        {
            "code": "12-00",
            "name": "SECRETARÍA DE ALIMENTACIÓN",
            "id": "9c15f163-897a-4f75-8cab-c2677866b89e"
        },
        {
            "code": "13-00",
            "name": "SECRETARÍA DE DESPACHO DEL GOBERNADOR",
            "id": "36eabe85-408c-4be1-872d-34328b7b4125"
        },
        {
            "code": "13-2",
            "name": "DIRECCIÓN OBSERVACIÓN SOCIAL Y POLITICA",
            "id": "0b18f5d2-f773-4e28-98b8-037a778b48fe"
        },
        {
            "code": "13-3",
            "name": "DIRECCIÓN GENERAL DE INFORMATICA",
            "id": "2d63cc1f-8a17-4ec9-b9ac-7cde1c8f2be5"
        },
        {
            "code": "13-4",
            "name": "DIRECCIÓN DE UNIDAD AEREA DEL ESTADO GUARICO",
            "id": "e39ff10c-6c0e-48ac-aa85-ad785436de01"
        },
        {
            "code": "13-5",
            "name": "RESIDENCIA OFICIAL DEL GOBERNADOR",
            "id": "50c1629a-5b53-4419-8ded-9bec2790dcf3"
        },
        {
            "code": "13-8",
            "name": "DIRECCIÓN DE RELACIONES INSTITUCIONALES",
            "id": "3fc38a9c-9f00-43fa-b10c-eb56cfbd7bd9"
        },
        {
            "code": "14-00",
            "name": "SECRETARÍA PRIVADA",
            "id": "4357cab4-568a-468e-a566-576608e651f3"
        },
        {
            "code": "15-00",
            "name": "DESPACHO DEL GOBERNADOR",
            "id": "d7c4f782-7c3b-4148-ad2a-64c2b4585a6b"
        },
        {
            "code": "15-1",
            "name": "CONSULTORIA  JURIDICA",
            "id": "b471ea4e-8be1-427d-ba18-96a5fe9aacef"
        },
        {
            "code": "15-2",
            "name": "DIRECCIÓN GENERAL DE AUDITORIA INTERNA",
            "id": "33ea38de-ab38-4beb-bb2c-98f22abb418d"
        },
        {
            "code": "15-4",
            "name": "COMISIÓN ÚNICA DE CONTRATACIONES",
            "id": "b76415a6-8e94-4de0-b017-aa31a9d83930"
        },
        {
            "code": "15-8",
            "name": "DIRECCIÓN GENERAL DE ATENCIÓN AL CIUDADANO",
            "id": "00172ac1-bc3e-49f3-9a74-dc446eacb12c"
        },
        {
            "code": "15-9",
            "name": "SECRETARIA DE COMUNICACIÓN E INFORMACIÓN",
            "id": "2981dfe2-4e7b-402d-9182-ca83de6efeb8"
        },
        {
            "code": "16-00",
            "name": "SECRETARIA DE SERVICIOS PÚBLICOS",
            "id": "62c0afe0-dcb3-4d49-84a0-b307332f76d3"
        },
        {
            "code": "17-00",
            "name": "SECRETARIA DE INSPECCIÓN Y CONTROL DE LA GESTIÓN DE GOBIERNO",
            "id": "2cb4ee87-d625-4d61-8b24-6ba66e9e0066"
        },
        {
            "code": "18-00",
            "name": "SECRETARÍA DE TRANSPORTE",
            "id": "8f3eefca-fa90-4ada-8382-1412252505f6"
        },
        {
            "code": "19-00",
            "name": "SECRETARIA DE INDUSTRIA Y COMERCIO",
            "id": "0c8e32a7-59db-4cfb-8097-75c92a1faf35"
        },
        {
            "code": "20-00",
            "name": "SECRETARÍA DE OBRAS PÚBLICAS",
            "id": "f4d82f4d-0229-4275-a00e-f96c4598c3df"
        },
        {
            "code": "21-00",
            "name": "SECRETARIA DE PRODUCCION AGROPECUARIA",
            "id": "58a45c32-7855-4b78-a9bf-11917e25dcf1"
        },
        {
            "code": "22-00",
            "name": "SECRETARIA DE INFORMACIÓN Y COMUNICACIÓN",
            "id": "99cce92b-a214-4df4-a5bb-a8bf4812c729"
        },
        {
            "code": "1000",
            "name": "FUNDACIÓN PARA LA CULTURA DEL ESTADO GUÁRICO (FUNDACULGUA)",
            "id": "0276d249-7b0c-4c77-a185-9d3d9414517b"
        },
        {
            "code": "1001",
            "name": "FUNDACIÓN SOCIALISTA DE ATENCIÓN MÉDICA INTEGRAL DEL ESTADO BOLIVARIANO DE GUÁRICO (FUSAMIEBG)",
            "id": "8998f50d-310e-420e-8780-27e181af36b5"
        },
        {
            "code": "1002",
            "name": "FONDO DE TRANSPORTE DEL ESTADO GUÁRICO (FONGUÁRICO)",
            "id": "e099ad33-09f1-4a99-be22-6a9829510ad2"
        },
        {
            "code": "1003",
            "name": "INSTITUTO REGIONAL DEL DEPORTE DEL EDO. BOLIVARIANO DE GUÁRICO (IRDEBG)",
            "id": "bf5b64c2-2ead-44d6-b0f4-2a0450cd4719"
        },
        {
            "code": "1004",
            "name": "FODESOPROEGUA",
            "id": "9a068409-bfaa-43e5-9905-176186333e51"
        },
        {
            "code": "1005",
            "name": "INSTITUTO DE CIENCIAS Y TECNOLOGÍAS DEL ESTADO GUÁRICO  (INCITEG)",
            "id": "b8bb7d7b-71e5-4933-a676-fced2adafb96"
        },
        {
            "code": "1006",
            "name": "FUNDACIÓN PATRIA SOCIALISTA (FPS)",
            "id": "1f634f72-754c-4ee2-813a-da442188ba71"
        },
        {
            "code": "1007",
            "name": "CONSEJO ESTADAL DE PLANIFICACIÓN Y COORDINACIÓN DE POLÍTICAS PÚBLICAS  (COPLAN-GUÁRICO)",
            "id": "3b079830-985e-437d-9fc7-c8c64bcd71e9"
        },
        {
            "code": "1008",
            "name": "FUNDACIÓN DE LOS NIÑOS Y NIÑAS DEL ESTADO BOLIVARIANO DE GUARICO",
            "id": "c1dd4288-b756-4e70-a59c-bbdc19d90e44"
        },
        {
            "code": "1009",
            "name": "ASOCIACIÓN DE MEDICINA Y CIENCIAS APLICADAS AL DEPORTE (ASOMECID)",
            "id": "d466640f-df3d-4112-b4bf-7fb0af4740e9"
        },
        {
            "code": "1010",
            "name": "EJE PARA LA ARTICULACIÓN DEL EMPODERAMIENTO DE LOS CONSEJOS COMUNALES (EMCOMUNA)",
            "id": "fec0b378-157f-498a-be04-4b33d3f2b637"
        },
        {
            "code": "1011",
            "name": "SUPERINTENDENCIA DE ADMINISTRACIÓN TRIBUTARIA DEL ESTADO BOLIVARIANO DE GUARICO (SUATEBG)",
            "id": "06adb13a-59a2-407a-9602-3e1cc5f3752a"
        },
        {
            "code": "1012",
            "name": "INSTITUTO DE LA JUVENTUD DEL ESTADO GUÁRICO (INJUVEG)",
            "id": "74acda4e-8438-409b-9a4d-b25a6f2bae0a"
        },
        {
            "code": "1013",
            "name": "CORPOGUÁRICO",
            "id": "f31a8b8a-586a-4375-a889-153bcff9eced"
        },
        {
            "code": "1014",
            "name": "CONSEJO LEGISLATIVO DEL ESTADO BOLIVARIANO DE GUÁRICO (CLEBG)",
            "id": "1e5c0ac0-8a4b-48ab-b028-d2da897fcc75"
        },
        {
            "code": "1015",
            "name": "PROCURADURIA DEL ESTADO BOLIVARIANO DE GUÁRICO",
            "id": "8ca44e3f-f8af-40db-aa5f-d33a8404cf7c"
        },
        {
            "code": "1016",
            "name": "FONDO DE DESARROLLO REGIONAL DEL ESTADO GUÁRICO (FONDER)",
            "id": "52363a3d-a506-4227-9b93-cd082c42cd2f"
        },
        {
            "code": "1017",
            "name": "RED DE BIBLIOTECAS PÚBLICAS DEL ESTADO GUARICO",
            "id": "dfdacd63-17e2-459e-a4a5-8b6d49ebccd9"
        },
        {
            "code": "1018",
            "name": "INSTITUTO AUTÓNOMO DE LA VIVIENDA Y HÁBITAT DEL EDO. BOLIVARIANO DE GUÁRICO (IAVHEBG)",
            "id": "7b0b2499-8f27-4baf-a4ff-0855ac541a9a"
        },
        {
            "code": "1019",
            "name": "INSTITUTO DE LA MUJER DEL ESTADO BOLIVARIANO DE GUÁRICO (IMUBGUA)",
            "id": "a303c1e4-42cd-43ee-8ac3-fa352095643d"
        },
        {
            "code": "1021",
            "name": "INSTITUTO AUTONOMO DE LA POLICIA DEL EDO. BOL. GUARICO (IAPEBG)",
            "id": "a06acb04-0089-4925-9fe3-10dc164f6173"
        },
        {
            "code": "1022",
            "name": "FUNDACIÓN SISTEMA BOLIVARIANO DE COMUNICACIÓN E INFORMACIÓN GUÁRICO",
            "id": "fa791bae-011e-46e8-84d2-140f8e085240"
        },
        {
            "code": "1023",
            "name": "INSTITUTO PUBLICO MINERO DEL ESTADO BOLIVARIANO DE GUARICO",
            "id": "effb67d8-1b1f-4ccc-a73a-ffca6f43d0b2"
        },
        {
            "code": "1027",
            "name": "AGUAS TERMALES HOTEL Y SPA S.A",
            "id": "a50add86-2909-43f7-9f0a-2e8a244ce274"
        },
        {
            "code": "1028",
            "name": "AGROGUÁRICO POTENCIA C.A",
            "id": "1c03eec4-a818-4226-8684-dd22a4bc2016"
        },
        {
            "code": "1029",
            "name": "INSTITUTO DE PREVISIÓN SOCIAL DEL POLICIA (I.P.S.P.E.G.U.A)",
            "id": "d103fef1-c139-4d38-8b83-9c759b9a3f9c"
        },
        {
            "code": "1030",
            "name": "FUNDACIÓN DE PERSONAS AUTISTAS DEL GUÁRICO (FUPAGUA)",
            "id": "ac156461-caad-4383-97c9-9b0742c4248f"
        },
        {
            "code": "1031",
            "name": "CIRCUNSCRIPCIÓN MILITAR DE LA ZODI GUARICO",
            "id": "b5b489f3-8532-415e-b061-a5522842fa9d"
        },
        {
            "code": "1032",
            "name": "FUNDACIÓN ORQUESTA SINF. INFANTIL Y JUVENIL DEL EDO. GUÁRICO (FOSIJEG)",
            "id": "a319b0bf-e14c-4366-ad34-62dec9d53c45"
        },
        {
            "code": "1033",
            "name": "FUNDACIÓN ORQUESTA SINFONICA DEL ESTADO GUÁRICO (FOSEG)",
            "id": "367ce986-558e-4981-9407-77b44b14c872"
        },
        {
            "code": "1034",
            "name": "ASOCIACIÓN DE POLICIAS RETIRADOS DEL EDO. GUÁRICO (ASOPREGUA)",
            "id": "62f9460f-5106-4efe-910a-7aff4d0ebaeb"
        },
        {
            "code": "1035",
            "name": "ALIMENTOS DEL GUARICO S.A (ALGUARISA)",
            "id": "0cf9ada3-79df-4a64-84dd-e749406474d3"
        },
        {
            "code": "1036",
            "name": "CONSTRUGUÁRICO, S.A",
            "id": "be7390cb-28ad-442f-a564-980f03ecfa2b"
        },
        {
            "code": "1037",
            "name": "SISTEMA SOCIALISTA DE PROVEDURIA GUARICO (SISOPROGUA)",
            "id": "9e1e3d47-6e16-49d2-8d8f-ad7448338f8c"
        },
        {
            "code": "1038",
            "name": "BUS GUARICO",
            "id": "e667599c-5ee6-4880-95c3-69506d17bdcd"
        },
        {
            "code": "1039",
            "name": "CONSTRUVIALGUA, C.A",
            "id": "7b765398-4902-4cad-a800-f5554a788e04"
        },
        {
            "code": "1040",
            "name": "FONDO DE EFICIENCIA PARA EL DESARROLLO DEL ESTADO BOLIVARIANO DE GUARICO",
            "id": "0a0cdc3b-09c5-47b9-9cc8-36836c8dd8e8"
        },
        {
            "code": "1041",
            "name": "DISTRIBUIDORA DE GAS GUÁRICO (DIGASGUA)",
            "id": "04e4bb00-6236-441a-89c0-d49ef903572a"
        },
        {
            "code": "1042",
            "name": "CORPOGUARICO POTENCIA, C.A",
            "id": "4f4f6b49-05aa-4441-adca-520cebc6f497"
        },
        {
            "code": "1043",
            "name": "CORPOTUREBG",
            "id": "f06d4850-b98f-4b1b-9f85-a87f0d41c302"
        },
        {
            "code": "1044",
            "name": "FONDO PARA EL EMPRENDIMIENTO DEL ESTADO GUARICO (FONEMGUA)",
            "id": "a5edf576-6b9f-49ab-b599-5d651ce73dab"
        },
        {
            "code": "1045",
            "name": "CONSTRUSALUD",
            "id": "4740b26f-1381-420c-9790-0368c9aa07c9"
        },
        {
            "code": "1046",
            "name": "SOCIEDAD DE GARANTIAS RECIPROCAS",
            "id": "2666b8a4-1eca-4d3f-95b5-1f0cd08dec6f"
        },
        {
            "code": "1047",
            "name": "FUNDACIÓN DE LAS ARTES DEL ESTADO BOLIVARIANO DE GUÁRICO (FUNDARTGUA)",
            "id": "02c1bf1f-dd14-4a66-b962-a4769b24fcb2"
        },
        {
            "code": "1048",
            "name": "ALCARAVÁN SISTEMAS TECNOLÓGICOS",
            "id": "d395c593-708d-4223-8b4a-2a25ceb001f6"
        }
    ]


    for (const institution of institutions) {

        await db.runInTransaction(async (client) => {
            const institutionId = institution.id;

            const query = `
                INSERT INTO institutions (id, code, name, created_at, updated_at) 
                VALUES ($1, $2, $3, $4, $5)
                
                ON CONFLICT (id) DO UPDATE 
                SET 
                    code = $2,
                    name = $3,
                    updated_at = $5
            `;

            await client.query<Municipality>(query, [
                institutionId,
                institution.code,
                institution.name,
                new Date(),
                new Date()
            ]);

        });

    }


    console.log('✅ Institutions seeded successfully!')
}