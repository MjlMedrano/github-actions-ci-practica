# Informe – Laboratorio 5.1: Creación de un Workflow de GitHub Actions para CI

- **Estudiante:** Medrano Medrano Adrian Mijael
- **Usuario de GitHub:** MjlMedrano
- **Repositorio:** https://github.com/MjlMedrano/github-actions-ci-practica

---

## 1. Descripción del proyecto

El proyecto es una **API REST de usuarios** construida con **Node.js y Express**. Sigue la misma estructura del laboratorio: `app.js` define la aplicación y `server.js` solo la pone en marcha. Así, las pruebas pueden usar la aplicación sin levantar un servidor real.

La entidad de dominio es **Usuario** (`id`, `name`, `email`). Los datos se guardan en un arreglo en memoria. La API implementa las operaciones CRUD completas:

| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| GET | `/health` | Estado del servicio | 200 |
| GET | `/users` | Listar usuarios | 200 |
| GET | `/users/:id` | Obtener un usuario | 200 / 404 |
| POST | `/users` | Crear un usuario | 201 / 400 |
| PUT | `/users/:id` | Actualizar un usuario | 200 / 400 / 404 |
| DELETE | `/users/:id` | Eliminar un usuario | 204 / 404 |

**Herramientas utilizadas:**

- **Express:** framework de la API.
- **Jest:** ejecución de pruebas y reporte de cobertura.
- **Supertest:** pruebas de integración sobre las rutas HTTP.
- **ESLint:** análisis estático del código.
- **GitHub Actions:** integración continua.

Se escribieron **11 pruebas** en `app.test.js`. Cada operación se prueba en su caso exitoso y en sus casos de error (datos faltantes → 400, usuario inexistente → 404). Con eso se alcanzó **100 % de cobertura** en `app.js`.

### Estructura del repositorio

```
github-actions-ci-practica/
├── .github/workflows/ci.yml   # Workflow de CI
├── image/                     # Capturas del informe
├── app.js                     # API CRUD de usuarios
├── app.test.js                # Pruebas con Jest y Supertest
├── server.js                  # Arranque del servidor
├── eslint.config.js           # Configuración de ESLint
├── package.json
├── package-lock.json
├── .gitignore
├── README.md
└── INFORME.md
```

---

## 2. Pipeline de CI configurado

El workflow está en `.github/workflows/ci.yml`, se llama **CI Practica** y se ejecuta en cada `push` y en cada `pull_request` hacia `main`.

```yaml
name: CI Practica

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    env:
      FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true

    strategy:
      matrix:
        node-version: [20, 22]

    steps:
      - name: Checkout del codigo
        uses: actions/checkout@v6

      - name: Configurar Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v6
        with:
          node-version: ${{ matrix.node-version }}

      - name: Instalar dependencias
        run: npm ci

      - name: Ejecutar linting
        run: npm run lint

      - name: Ejecutar pruebas
        run: npm test

      - name: Generar reporte de cobertura
        run: npm run test:coverage
```

| Requisito de la práctica | Paso del workflow |
|---|---|
| Checkout del código | `actions/checkout@v6` |
| Setup del entorno | `actions/setup-node@v6`, con una matriz de Node.js 20 y 22 |
| Instalación de dependencias | `npm ci` (instala exactamente lo definido en `package-lock.json`) |
| Compilación/build | **No aplica:** JavaScript con Node.js no requiere compilación |
| Linting | `npm run lint` → `eslint .` |
| Pruebas unitarias e integrales | `npm test` → `jest` (con Supertest) |
| Reporte de cobertura | `npm run test:coverage` → `jest --coverage` |

**Decisiones tomadas:**

- **Matriz con Node.js 20 y 22:** se usa en lugar de 18 y 20, porque la versión actual de ESLint (10.x) requiere Node.js 20.19 o superior y el job de Node 18 fallaría.
- **Linting antes de las pruebas:** si el código no cumple las reglas, el pipeline se detiene enseguida.
- **Archivo `eslint.config.js` con las variables globales de Node y de Jest:** sin esta configuración, ESLint marca `describe`, `test` y `expect` como no definidos.

---

## 3. Procedimiento y comandos utilizados

Los comandos se ejecutaron en **PowerShell (Windows)**, dentro de la carpeta del repositorio.

### 3.1 Creación del repositorio y del proyecto

El repositorio `github-actions-ci-practica` se creó desde la web de GitHub como **público**, con un `README.md` inicial, para que naciera con la rama `main`. Se eligió público porque, en una cuenta gratuita, la protección de rama solo se aplica a repositorios públicos.

| Comando | Para qué se usó |
|---|---|
| `git clone https://github.com/MjlMedrano/github-actions-ci-practica.git` | Descargar el repositorio a la computadora |
| `cd github-actions-ci-practica` | Entrar a la carpeta del repositorio |
| `git branch` | Verificar que la rama de trabajo es `main` |
| `npm init -y` | Crear el `package.json` del proyecto Node.js |
| `npm install express` | Instalar Express, el framework de la API (dependencia de producción) |
| `npm install --save-dev jest supertest` | Instalar Jest (pruebas y cobertura) y Supertest (peticiones HTTP en las pruebas) como dependencias de desarrollo |
| `code .` | Abrir el proyecto en VS Code para crear `app.js`, `server.js` y `app.test.js` |

Se agregaron los scripts al `package.json`:

```json
"scripts": {
  "start": "node server.js",
  "test": "jest",
  "test:coverage": "jest --coverage",
  "lint": "eslint ."
}
```

| Script | Para qué sirve |
|---|---|
| `start` | Iniciar el servidor con `server.js` |
| `test` | Ejecutar las pruebas con Jest |
| `test:coverage` | Ejecutar las pruebas y generar el reporte de cobertura |
| `lint` | Analizar todo el código con ESLint |

Se creó el archivo `.gitignore` para no subir las dependencias, las variables de entorno ni el reporte de cobertura (que se genera en cada ejecución):

```
node_modules/
.env
coverage/
```

| Comando | Para qué se usó |
|---|---|
| `npm test` | Ejecutar las 11 pruebas localmente antes de subir el código |
| `npm run test:coverage` | Comprobar localmente que la cobertura es del 100 % |
| `git add .` | Preparar todos los archivos para el commit |
| `git commit -m "feat: agrega API CRUD de usuarios con pruebas unitarias"` | Guardar el cambio en el historial de Git |
| `git push origin main` | Subir el commit a GitHub |

### 3.2 Configuración de ESLint y del workflow de CI

| Comando | Para qué se usó |
|---|---|
| `npm install --save-dev eslint` | Instalar ESLint para el análisis estático del código |
| `npm install --save-dev @eslint/js globals` | Instalar las reglas recomendadas de ESLint (`@eslint/js`) y las variables globales de Node.js y Jest (`globals`), que usa el archivo de configuración |
| `npm run lint` | Verificar localmente que el código no tiene errores de linting |
| `mkdir .github\workflows` | Crear la carpeta donde GitHub busca los workflows |

Contenido de `eslint.config.js`:

```javascript
const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  { ignores: ['node_modules/', 'coverage/'] },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
  },
  {
    files: ['**/*.test.js'],
    languageOptions: { globals: { ...globals.jest } },
  },
];
```

| Bloque | Para qué sirve |
|---|---|
| `ignores` | Excluir del análisis las librerías externas y el reporte de cobertura |
| `js.configs.recommended` | Activar las reglas estándar de ESLint (por ejemplo, `no-unused-vars`) |
| `files: ['**/*.js']` | Indicar que el código es de Node.js con `require` (CommonJS) |
| `files: ['**/*.test.js']` | Reconocer `describe`, `test` y `expect` de Jest en los archivos de prueba |

Luego se creó `.github/workflows/ci.yml` (contenido en la sección 2) y se subieron los cambios:

| Comando | Para qué se usó |
|---|---|
| `git add .` | Preparar el workflow y la configuración de ESLint |
| `git commit -m "ci: agrega workflow de CI con linting, pruebas y cobertura"` | Registrar el workflow |
| `git push origin main` | Subirlo; el push activó la primera ejecución del workflow |
| `git status` | Revisar qué archivos faltaban por subir. Mostró que `eslint.config.js` no se había agregado y que `package.json` y `package-lock.json` tenían cambios |
| `git commit -m "fix: agrega configuracion y dependencias de ESLint"` | Corregir la primera ejecución fallida, subiendo la configuración y las dependencias que faltaban |

### 3.3 Fallo intencional y corrección

Se agregó en `app.js`, debajo de `let nextId = 3;`, la línea:

```javascript
const unusedVariable = 'esto causara un error de linting';
```

| Comando | Para qué se usó |
|---|---|
| `npm run lint` | Comprobar localmente que ESLint detecta el error `no-unused-vars` |
| `git add app.js` | Preparar el archivo con el error |
| `git commit -m "test: fuerza un error de linting para probar el pipeline"` | Registrar el error intencional |
| `git push origin main` | Subirlo para ver fallar el workflow en el paso de linting |
| `npm run lint` | Después de borrar la línea, verificar que el error desapareció |
| `git commit -m "fix: elimina variable sin usar"` | Registrar la corrección |
| `git push origin main` | Subir la corrección; el workflow volvió a pasar |

### 3.4 Protección de rama

Se configuró desde la web de GitHub, sin comandos: **Settings → Branches → Add classic branch protection rule**. El patrón de rama es `main`, con la opción **Require status checks to pass before merging** y los checks `build-and-test (20)` y `build-and-test (22)`.

### 3.5 Pull request desde una rama de feature

| Comando | Para qué se usó |
|---|---|
| `git checkout main` | Ubicarse en la rama principal |
| `git pull origin main` | Traer la última versión de `main` desde GitHub |
| `git checkout -b feature/documentar-endpoints` | Crear una rama nueva para el cambio y cambiarse a ella |
| `git add README.md` | Preparar el cambio menor (lista de endpoints en el README) |
| `git commit -m "docs: documenta los endpoints de la API"` | Registrar el cambio en la rama de feature |
| `git push -u origin feature/documentar-endpoints` | Subir la rama a GitHub; `-u` la conecta con la rama remota |

En GitHub se creó la pull request hacia `main` con **Compare & pull request**. Cuando los dos checks pasaron, se fusionó con **Merge pull request → Confirm merge**. Después se actualizó la copia local:

| Comando | Para qué se usó |
|---|---|
| `git checkout main` | Volver a la rama principal |
| `git pull origin main` | Traer a la computadora el resultado del merge |

### 3.6 Entrega del informe

Como `main` está protegida, el informe también se subió mediante una rama y una pull request:

| Comando | Para qué se usó |
|---|---|
| `git checkout -b docs/informe` | Crear una rama para el informe |
| `git add .` | Preparar `INFORME.md`, `README.md` y la carpeta `image/` con las capturas |
| `git commit -m "docs: agrega informe del laboratorio y enlace en README"` | Registrar el informe |
| `git push -u origin docs/informe` | Subir la rama y crear la pull request hacia `main` |

---

## 4. Evidencias

### 4.1 Preparación local

Instalación de dependencias:

![Instalación de dependencias](./image/Captura%20de%20pantalla%202026-11-11%20085025.png)

Ejecución local de las pruebas (11 pruebas aprobadas):

![Pruebas locales](./image/Captura%20de%20pantalla%202026-11-11%20085759.png)

Archivos del proyecto subidos al repositorio:

![Repositorio en GitHub](./image/Captura%20de%20pantalla%202026-11-11%20090750.png)

### 4.2 Historial de ejecuciones en la pestaña Actions

El historial muestra una ejecución exitosa, una fallida (error forzado) y la ejecución exitosa posterior a la corrección:

![Historial de Actions](./image/Captura%20de%20pantalla%202026-11-11%20100002.png)

### 4.3 Workflow exitoso con cobertura

Los dos jobs de la matriz (Node.js 20 y 22) terminaron correctamente:

![Workflow exitoso](./image/Captura%20de%20pantalla%202026-11-11%20094401.png)

Detalle del paso **Generar reporte de cobertura**: 11 pruebas aprobadas y 100 % de cobertura en sentencias, ramas, funciones y líneas.

![Reporte de cobertura](./image/Captura%20de%20pantalla%202026-11-11%20094443.png)

### 4.4 Workflow fallido

Se agregó a propósito una variable sin usar en `app.js` (`const unusedVariable = ...`). Primero se comprobó el error de forma local:

![Error de linting local](./image/Captura%20de%20pantalla%202026-11-11%20095602.png)

Después se subió el cambio. El workflow falló en el paso **Ejecutar linting** por la regla `no-unused-vars`. Los pasos de pruebas y cobertura no llegaron a ejecutarse:

![Workflow fallido](./image/Captura%20de%20pantalla%202026-11-11%20095834.png)

Luego se eliminó la variable, y el workflow volvió a ejecutarse correctamente (ver el historial en la sección 4.2).

### 4.5 Regla de protección de rama

Se creó una regla para `main` que exige que pasen los checks `build-and-test (20)` y `build-and-test (22)` antes de permitir un merge:

![Configuración de la regla de protección](./image/Captura%20de%20pantalla%202026-11-11%20100937.png)

Regla creada en **Settings → Branches**:

![Regla de protección creada](./image/Captura%20de%20pantalla%202026-11-11%20100942.png)

La revisión de código obligatoria (opcional en la práctica) no se activó. Como el repositorio es individual, GitHub no permite que el autor apruebe su propia pull request, y el merge quedaría bloqueado.

### 4.6 Pull request desde una rama de feature

Se creó la rama `feature/documentar-endpoints` con un cambio menor en el `README.md` y se subió a GitHub:

![Push de la rama feature](./image/Captura%20de%20pantalla%202026-11-11%20101603.png)

Al abrir la pull request, el workflow de CI se ejecutó solo. Los dos checks aparecen marcados como **Required**, y el merge se habilitó solo cuando ambos pasaron:

![Pull request con checks aprobados](./image/Captura%20de%20pantalla%202026-11-11%20101918.png)

Pull request fusionada en `main`:

![Pull request fusionada](./image/Captura%20de%20pantalla%202026-11-11%20102034.png)

---

## 5. Conclusiones y reflexión

- **El CI detecta errores que no se ven a simple vista.** Con la variable sin usar, la aplicación seguía funcionando y las pruebas habrían pasado, pero el linting detuvo el pipeline. Así, problemas de calidad que en una revisión manual pasarían desapercibidos no llegan a `main`.
- **Elimina el "en mi máquina funciona".** En la primera ejecución el workflow falló porque `eslint.config.js` y sus dependencias (`@eslint/js` y `globals`) no se habían subido al repositorio. En mi computadora todo parecía bien, pero el servidor de GitHub parte de un entorno limpio e instala solo lo que está en el repositorio. Ese fallo mostró la importancia de que `package.json` y `package-lock.json` estén completos y de usar `npm ci`.
- **La matriz de versiones aporta confianza.** Ejecutar el mismo pipeline con Node.js 20 y 22 en paralelo confirma que la aplicación funciona en más de un entorno, sin trabajo adicional.
- **La cobertura muestra qué partes del código están probadas.** Para llegar al 100 % no bastó con probar los casos exitosos: también hubo que probar los casos de error (400 y 404).
- **La protección de rama convierte al CI en una regla del equipo.** Sin ella, el CI solo avisa. Con ella, GitHub no permite fusionar código que no pasó los checks. Junto con el flujo de ramas de feature y pull requests, es la forma de trabajo habitual en un equipo de desarrollo.

En resumen, la integración continua automatiza la verificación de cada cambio. Reduce errores, da retroalimentación en segundos y permite integrar código a `main` con confianza.
