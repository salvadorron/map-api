# Guía de Datos para Presentación - Sistema de Mapeo Territorial

Este documento contiene sugerencias de **categorías** y **formularios** para poblar el mapa con información realista y equilibrada para la presentación.

---

## 📋 Categorías Sugeridas

### 1. Infraestructura
- **Nombre**: Infraestructura
- **Icono**: `building` o `road`
- **Color**: `#2563eb` (azul)
- **Element Type**: `infrastructure`
- **Descripción**: Infraestructura pública y privada

### 2. Servicios Públicos
- **Nombre**: Servicios Públicos
- **Icono**: `wrench` o `tools`
- **Color**: `#10b981` (verde)
- **Element Type**: `public_service`
- **Descripción**: Servicios básicos de la comunidad

### 3. Educación
- **Nombre**: Educación
- **Icono**: `school` o `book`
- **Color**: `#f59e0b` (naranja)
- **Element Type**: `education`
- **Descripción**: Centros educativos y espacios de aprendizaje

### 4. Salud
- **Nombre**: Salud
- **Icono**: `hospital` o `cross`
- **Color**: `#ef4444` (rojo)
- **Element Type**: `health`
- **Descripción**: Centros de salud y servicios médicos

### 5. Espacios Públicos
- **Nombre**: Espacios Públicos
- **Icono**: `park` o `tree`
- **Color**: `#22c55e` (verde claro)
- **Element Type**: `public_space`
- **Descripción**: Parques, plazas y áreas recreativas

### 6. Transporte
- **Nombre**: Transporte
- **Icono**: `bus` o `car`
- **Color**: `#6366f1` (índigo)
- **Element Type**: `transport`
- **Descripción**: Rutas, paradas y puntos de transporte

---

## 📝 Formularios Sugeridos

### Formulario 1: Encuesta de Infraestructura Vial
**Categoría asociada**: Infraestructura

**Tipo de geometría**: `LineString` (para vías) o `Point` (para puntos de referencia)

**Inputs**:
1. **Tipo de vía** (select, requerido)
   - Opciones: Asfaltada, Concreta, Tierra, Mixta
2. **Estado de la vía** (select, requerido)
   - Opciones: Excelente, Bueno, Regular, Malo, Muy malo
3. **Ancho aproximado** (number, requerido)
   - Placeholder: "Metros"
4. **Observaciones** (textarea, opcional)
   - Placeholder: "Describa el estado actual de la vía"

**Ejemplo de datos realistas**:
- Vía principal del centro: Asfaltada, Bueno, 8 metros, "Requiere mantenimiento menor"
- Calle secundaria: Concreta, Regular, 5 metros, "Algunos baches presentes"

**Ejemplo de geometría LineString** (vía):
```json
{
  "type": "LineString",
  "coordinates": [
    [-67.3536, 9.9111],
    [-67.3540, 9.9115],
    [-67.3545, 9.9120],
    [-67.3550, 9.9125]
  ]
}
```

**Ejemplo de geometría Point** (puente o estructura):
```json
{
  "type": "Point",
  "coordinates": [-67.3540, 9.9115]
}
```

---

### Formulario 2: Inventario de Servicios Básicos
**Categoría asociada**: Servicios Públicos

**Tipo de geometría**: `Point` (para puntos de servicio) o `Polygon` (para zonas de cobertura)

**Inputs**:
1. **Tipo de servicio** (select, requerido)
   - Opciones: Agua potable, Electricidad, Gas, Internet, Telefonía
2. **Cobertura** (select, requerido)
   - Opciones: Total, Parcial, Sin cobertura
3. **Frecuencia del servicio** (select, requerido)
   - Opciones: Continuo, Intermitente, Esporádico
4. **Observaciones** (textarea, opcional)

**Ejemplo de datos realistas**:
- Agua potable: Total, Intermitente, "Cortes programados los martes"
- Electricidad: Parcial, Continuo, "Algunas zonas sin servicio"

**Ejemplo de geometría Point** (punto de servicio):
```json
{
  "type": "Point",
  "coordinates": [-67.3520, 9.9100]
}
```

**Ejemplo de geometría Polygon** (zona de cobertura):
```json
{
  "type": "Polygon",
  "coordinates": [[
    [-67.3530, 9.9090],
    [-67.3510, 9.9090],
    [-67.3510, 9.9110],
    [-67.3530, 9.9110],
    [-67.3530, 9.9090]
  ]]
}
```

---

### Formulario 3: Registro de Centro Educativo
**Categoría asociada**: Educación

**Tipo de geometría**: `Point` (para ubicación del centro) o `Polygon` (para delimitar el terreno)

**Inputs**:
1. **Nivel educativo** (checkbox, requerido)
   - Opciones: Inicial, Primaria, Secundaria, Técnica, Universitaria
2. **Número de estudiantes** (number, requerido)
3. **Número de docentes** (number, requerido)
4. **Estado de la infraestructura** (select, requerido)
   - Opciones: Excelente, Bueno, Regular, Requiere reparación
5. **Servicios disponibles** (checkbox, opcional)
   - Opciones: Biblioteca, Laboratorio, Cancha deportiva, Comedor
6. **Observaciones** (textarea, opcional)

**Ejemplo de datos realistas**:
- Escuela primaria: Primaria, 250 estudiantes, 12 docentes, Regular, Biblioteca y Cancha, "Requiere mejoras en techos"

**Ejemplo de geometría Point** (ubicación del centro):
```json
{
  "type": "Point",
  "coordinates": [-67.3500, 9.9080]
}
```

**Ejemplo de geometría Polygon** (terreno del centro educativo):
```json
{
  "type": "Polygon",
  "coordinates": [[
    [-67.3505, 9.9075],
    [-67.3495, 9.9075],
    [-67.3495, 9.9085],
    [-67.3505, 9.9085],
    [-67.3505, 9.9075]
  ]]
}
```

---

### Formulario 4: Ficha de Centro de Salud
**Categoría asociada**: Salud

**Tipo de geometría**: `Point` (para ubicación del centro) o `Polygon` (para delimitar el área del centro)

**Inputs**:
1. **Tipo de centro** (select, requerido)
   - Opciones: Ambulatorio, Hospital, Clínica, Consultorio
2. **Especialidades disponibles** (checkbox, requerido)
   - Opciones: Medicina general, Pediatría, Ginecología, Odontología, Emergencias
3. **Horario de atención** (text, requerido)
   - Placeholder: "Ej: Lunes a Viernes 8:00 AM - 4:00 PM"
4. **Número de camas** (number, opcional)
5. **Servicios adicionales** (textarea, opcional)

**Ejemplo de datos realistas**:
- Ambulatorio: Medicina general, Pediatría, "Lunes a Viernes 7:00 AM - 5:00 PM", "Vacunación disponible"

**Ejemplo de geometría Point** (ubicación del centro):
```json
{
  "type": "Point",
  "coordinates": [-67.3480, 9.9070]
}
```

**Ejemplo de geometría Polygon** (área del centro de salud):
```json
{
  "type": "Polygon",
  "coordinates": [[
    [-67.3485, 9.9065],
    [-67.3475, 9.9065],
    [-67.3475, 9.9075],
    [-67.3485, 9.9075],
    [-67.3485, 9.9065]
  ]]
}
```

---

### Formulario 5: Caracterización de Espacio Público
**Categoría asociada**: Espacios Públicos

**Tipo de geometría**: `Polygon` (recomendado para delimitar el área) o `Point` (si solo se marca la ubicación central)

**Inputs**:
1. **Tipo de espacio** (select, requerido)
   - Opciones: Parque, Plaza, Cancha deportiva, Área recreativa, Mirador
2. **Área aproximada** (number, requerido)
   - Placeholder: "Metros cuadrados"
3. **Equipamiento disponible** (checkbox, opcional)
   - Opciones: Bancas, Iluminación, Áreas verdes, Juegos infantiles, Pista de caminata
4. **Estado de mantenimiento** (select, requerido)
   - Opciones: Excelente, Bueno, Regular, Requiere mantenimiento
5. **Observaciones** (textarea, opcional)

**Ejemplo de datos realistas**:
- Parque central: Parque, 5000 m², Bancas, Iluminación, Áreas verdes, Juegos infantiles, Bueno, "Área muy visitada los fines de semana"

**Ejemplo de geometría Polygon** (área del parque):
```json
{
  "type": "Polygon",
  "coordinates": [[
    [-67.3550, 9.9130],
    [-67.3530, 9.9130],
    [-67.3530, 9.9150],
    [-67.3550, 9.9150],
    [-67.3550, 9.9130]
  ]]
}
```

**Ejemplo de geometría Point** (ubicación central de plaza pequeña):
```json
{
  "type": "Point",
  "coordinates": [-67.3540, 9.9140]
}
```

---

### Formulario 6: Encuesta de Transporte Público
**Categoría asociada**: Transporte

**Tipo de geometría**: `Point` (para paradas y terminales) o `LineString` (para rutas de transporte)

**Inputs**:
1. **Tipo de punto** (select, requerido)
   - Opciones: Parada de autobús; Terminal; Estación de metro; Punto de taxi
2. **Rutas que pasan** (text, requerido)
   - Placeholder: "Ej: Ruta 1, Ruta 5, Ruta 12"
3. **Frecuencia de paso** (select, requerido)
   - Opciones: Cada 5 min, Cada 10 min, Cada 15 min, Cada 30 min, Esporádico
4. **Estado de la parada** (select, requerido)
   - Opciones: Con techo, Sin techo, Con bancas, Sin bancas
5. **Observaciones** (textarea, opcional)

**Ejemplo de datos realistas**:
- Parada principal: Parada de autobús, "Ruta 1, Ruta 3, Ruta 7", Cada 10 min, Con techo y bancas, "Muy transitada en horas pico"

**Ejemplo de geometría Point** (parada de autobús):
```json
{
  "type": "Point",
  "coordinates": [-67.3560, 9.9120]
}
```

**Ejemplo de geometría LineString** (ruta de transporte):
```json
{
  "type": "LineString",
  "coordinates": [
    [-67.3560, 9.9120],
    [-67.3570, 9.9130],
    [-67.3580, 9.9140],
    [-67.3590, 9.9150]
  ]
}
```

---

## 📍 Guía de Coordenadas y Geometrías

### Tipos de Geometría por Categoría

| Categoría | Tipo de Geometría Recomendado | Uso |
|-----------|-------------------------------|-----|
| **Infraestructura** | `LineString` (vías) o `Point` (estructuras) | Vías como LineString, puentes/estructuras como Point |
| **Servicios Públicos** | `Point` (puntos) o `Polygon` (zonas) | Puntos de servicio como Point, zonas de cobertura como Polygon |
| **Educación** | `Point` o `Polygon` | Point para ubicación, Polygon para delimitar terreno |
| **Salud** | `Point` o `Polygon` | Point para ubicación, Polygon para área del centro |
| **Espacios Públicos** | `Polygon` (recomendado) o `Point` | Polygon para delimitar área, Point solo si es muy pequeño |
| **Transporte** | `Point` (paradas) o `LineString` (rutas) | Point para paradas/terminales, LineString para rutas |

### Coordenadas de Ejemplo (Estado Guárico, Venezuela)

**Nota**: Las coordenadas están en formato `[longitud, latitud]` (GeoJSON estándar). Todas las coordenadas están ubicadas dentro del estado Guárico.

**Rango del Estado Guárico**: 
- Longitud: aproximadamente -67.5° a -65.5°
- Latitud: aproximadamente 7.5° a 10.5°

#### Zona 1: San Juan de los Morros (Capital - Municipio 1)
- **Rango aproximado**: Longitud: -67.3600 a -67.3500, Latitud: 9.9100 a 9.9200
- **Ejemplos de coordenadas**:
  - Punto central: `[-67.3550, 9.9150]` (cerca del centro de San Juan de los Morros)
  - Parque: `[-67.3540, 9.9140]`
  - Escuela: `[-67.3500, 9.9080]`
  - Hospital: `[-67.3480, 9.9070]`

#### Zona 2: Calabozo (Municipio 2)
- **Rango aproximado**: Longitud: -67.4300 a -67.4200, Latitud: 8.9200 a 8.9300
- **Ejemplos de coordenadas**:
  - Punto central: `[-67.4250, 9.9250]` (cerca del centro de Calabozo)
  - Terminal: `[-67.4220, 9.9220]`
  - Plaza: `[-67.4230, 9.9240]`

#### Zona 3: Valle de la Pascua (Municipio 3)
- **Rango aproximado**: Longitud: -66.0100 a -66.0000, Latitud: 9.2000 a 9.2100
- **Ejemplos de coordenadas**:
  - Punto central: `[-66.0050, 9.2050]` (cerca del centro de Valle de la Pascua)
  - Cancha deportiva: `[-66.0020, 9.2070]`
  - Ambulatorio: `[-66.0010, 9.2030]`

### Ejemplos de Geometrías Completas

#### Point (Punto simple)
```json
{
  "type": "Point",
  "coordinates": [-67.3550, 9.9150]
}
```

#### LineString (Línea - vía o ruta)
```json
{
  "type": "LineString",
  "coordinates": [
    [-67.3536, 9.9111],
    [-67.3540, 9.9115],
    [-67.3545, 9.9120],
    [-67.3550, 9.9125]
  ]
}
```

#### Polygon (Área cerrada - parque, terreno)
```json
{
  "type": "Polygon",
  "coordinates": [[
    [-67.3550, 9.9130],
    [-67.3530, 9.9130],
    [-67.3530, 9.9150],
    [-67.3550, 9.9150],
    [-67.3550, 9.9130]
  ]]
}
```

**Nota importante**: En un Polygon, el primer y último punto deben ser iguales para cerrar el polígono.

### Sugerencias de Coordenadas por Tipo de Elemento

**Para Points** (escuelas, hospitales, paradas):
- Usa coordenadas con variación de ±0.002 en longitud y latitud entre elementos cercanos
- Ejemplo en Guárico: `[-67.3550, 9.9150]`, `[-67.3530, 9.9150]`, `[-67.3510, 9.9150]`

**Para LineStrings** (vías):
- Crea líneas con 3-5 puntos que sigan una dirección lógica
- Mantén una distancia razonable entre puntos (0.001-0.005 grados)
- Ejemplo en Guárico: De `[-67.3536, 9.9111]` a `[-67.3550, 9.9125]`

**Para Polygons** (parques, terrenos):
- Crea rectángulos o formas irregulares con 4-6 puntos
- Área típica: 0.002 x 0.002 grados (aproximadamente 200m x 200m)
- Ejemplo en Guárico: Cuadrado de `[-67.3550, 9.9130]` a `[-67.3530, 9.9150]`

### Municipios Principales del Estado Guárico

Para referencia, algunos municipios importantes y sus coordenadas aproximadas:

- **San Juan de los Morros** (Capital): `[-67.3531, 9.9114]`
- **Calabozo**: `[-67.4281, 8.9244]`
- **Valle de la Pascua**: `[-66.0075, 9.2156]`
- **Zaraza**: `[-65.3244, 9.3500]`
- **San José de Guaribe**: `[-65.8131, 9.8581]`
- **Ortiz**: `[-67.3331, 9.5831]`

---

## 🎯 Estrategia de Poblado del Mapa

### Distribución Sugerida por Categoría:

1. **Infraestructura**: 8-10 shapes
   - 3-4 vías principales (LineString)
   - 2-3 puentes o estructuras (Point)
   - 2-3 puntos de infraestructura menor (Point)

2. **Servicios Públicos**: 6-8 shapes
   - 2-3 puntos de agua (Point)
   - 2-3 puntos de electricidad (Point o Polygon para zonas)
   - 1-2 otros servicios (Point)

3. **Educación**: 4-6 shapes
   - 2-3 escuelas primarias (Point o Polygon)
   - 1-2 secundarias (Point o Polygon)
   - 1 centro técnico o universitario (Polygon recomendado)

4. **Salud**: 3-5 shapes
   - 2-3 ambulatorios (Point)
   - 1 hospital o clínica (Polygon recomendado)

5. **Espacios Públicos**: 5-7 shapes
   - 2-3 parques (Polygon)
   - 2 plazas (Polygon o Point si es pequeña)
   - 1-2 canchas o áreas recreativas (Polygon)

6. **Transporte**: 4-6 shapes
   - 3-4 paradas principales (Point)
   - 1 terminal o estación (Point o Polygon)

### Total: **30-42 shapes** con formularios completados

---

## 💡 Consejos para Datos Realistas

1. **Variedad en estados**: No todos los elementos deben estar en "Excelente". Mezcla: 30% Excelente, 40% Bueno, 25% Regular, 5% Requiere reparación.

2. **Fechas coherentes**: Usa fechas recientes pero variadas (últimos 2-3 meses).

3. **Números realistas**: 
   - Estudiantes: 50-500
   - Docentes: 5-30
   - Áreas: 500-10000 m²

4. **Observaciones variadas**: Algunas con observaciones detalladas, otras sin observaciones.

5. **Distribución geográfica**: Distribuye los shapes en diferentes municipios y parroquias para mostrar cobertura territorial.

6. **Nombres descriptivos**: Usa títulos como "Escuela Primaria San José", "Parque Central", "Ambulatorio Los Rosales".

---

## 📊 Ejemplo de Distribución por Municipio

**Municipio 1**: 
- 2 infraestructura
- 2 servicios públicos
- 1 educación
- 1 salud
- 1 espacio público
- 1 transporte
- **Total: 8 shapes**

**Municipio 2**:
- 2 infraestructura
- 1 servicios públicos
- 2 educación
- 1 salud
- 2 espacios públicos
- 2 transporte
- **Total: 10 shapes**

**Municipio 3**:
- 3 infraestructura
- 2 servicios públicos
- 1 educación
- 1 salud
- 1 espacio público
- 1 transporte
- **Total: 9 shapes**

---

## ✅ Checklist de Implementación

- [ ] Crear las 6 categorías sugeridas
- [ ] Crear los 6 formularios con sus respectivos inputs
- [ ] Asociar cada formulario a su categoría correspondiente
- [ ] Crear 30-42 shapes distribuidos en diferentes municipios/parroquias
- [ ] Usar geometrías apropiadas (Point, LineString, Polygon) según el tipo de elemento
- [ ] Verificar que las coordenadas estén dentro del rango del territorio
- [ ] Asegurar que los Polygons estén cerrados (primer y último punto iguales)
- [ ] Llenar cada shape con al menos 1 formulario
- [ ] Verificar que los datos sean variados y realistas
- [ ] Generar el reporte PDF para verificar que todo se vea bien

### Notas Importantes sobre Geometrías

1. **Formato GeoJSON**: Todas las coordenadas deben seguir el formato GeoJSON estándar `[longitud, latitud]`
2. **Polygons cerrados**: Los polígonos deben tener el primer y último punto idénticos
3. **Coordenadas válidas**: Asegúrate de que las coordenadas estén dentro del territorio que estás mapeando
4. **Variación espacial**: Distribuye los elementos de manera lógica, no todos en el mismo punto
5. **Escala apropiada**: 
   - Points: Para ubicaciones precisas
   - LineStrings: Para vías y rutas (3-10 puntos)
   - Polygons: Para áreas (4-8 puntos, área razonable)

---

**Nota**: Esta guía está diseñada para crear un mapa con información suficiente para una presentación profesional, sin saturarlo ni dejarlo vacío. Los datos deben parecer reales y coherentes entre sí.
