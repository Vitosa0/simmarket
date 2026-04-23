# SimMarket

<p align="center">
  <img src="./src/assets/branding/simmarket-mark-1024.png" alt="SimMarket" width="128" height="128" />
</p>

<p align="center">
  Dashboard de escritorio para <strong>SimCompanies</strong> con alertas, cartera, calculadora de costos, radar de ejecutivos y registro de contactos.
</p>

Repositorio oficial:
- [https://github.com/Vitosa0/simmarket](https://github.com/Vitosa0/simmarket)

Release objetivo actual:
- [SimMarket v1.0.7](https://github.com/Vitosa0/simmarket/releases/tag/v1.0.7)

## Qué incluye

- Alertas de mercado con escaneo manual y automático
- Soporte separado por servidor: `Magnates` y `Entrepreneurs`
- Catálogo completo de `142` activos con logos y agrupación por rubro
- Calculadora de costos con fee, transporte y validación rápida de salida
- Cartera con valuación bruta y neta, gráfico histórico e importación desde texto
- Registro de contactos con historial conversacional
- Radar de ejecutivos con lectura local de feedback
- Notificaciones locales en macOS y Windows
- Envío opcional de alertas por Discord y Telegram

## Plataformas compatibles

- macOS (`universal`: Apple Silicon + Intel)
- Windows 10/11 (`x64`)

Para instalar y usar la app no hace falta tener `Node.js` ni `npm`.

## Instalación

macOS:

- [Instalador `.pkg` universal](https://github.com/Vitosa0/simmarket/releases/download/v1.0.7/SimMarket-Installer-1.0.7-universal.pkg)
- [Imagen `.dmg` universal](https://github.com/Vitosa0/simmarket/releases/download/v1.0.7/SimMarket-1.0.7-universal.dmg)

1. Abrí el instalador.
2. Instalá `SimMarket.app` en `/Applications`.
3. El instalador crea también un acceso en el escritorio.
4. Para desinstalar, queda disponible:
   - `/Applications/Desinstalar SimMarket.command`

Windows:

- [Instalador `.exe` x64](https://github.com/Vitosa0/simmarket/releases/download/v1.0.7/SimMarket-Installer-1.0.7-x64.exe)

1. Abrí el instalador.
2. Elegí la carpeta de instalación o usá la sugerida.
3. El instalador crea accesos de escritorio y menú Inicio.
4. Para desinstalar, usá `Agregar o quitar programas` o el desinstalador incluido por el instalador.

## Primera ejecución y advertencias de seguridad

Como los instaladores actuales no están firmados ni notarizados, macOS y Windows pueden bloquear la primera apertura.

macOS (Gatekeeper):

1. Intentá abrir `SimMarket-Installer-<version>-universal.pkg` o `SimMarket.app`.
2. Si aparece el bloqueo de seguridad, cerrá el aviso.
3. Abrí `Configuración del Sistema` -> `Privacidad y seguridad`.
4. En la sección `Seguridad`, buscá el mensaje sobre SimMarket y apretá `Abrir igualmente`.
5. Confirmá con `Abrir` cuando macOS lo vuelva a pedir.

Windows (SmartScreen):

1. Abrí `SimMarket-Installer-<version>-x64.exe`.
2. Si aparece `Windows protegió su PC`, hacé clic en `Más información`.
3. Luego hacé clic en `Ejecutar de todas formas`.
4. Confirmá el diálogo de permisos de Windows (`Sí`) para continuar la instalación.

## Datos locales

La app usa como carpeta principal:

- `~/Library/Application Support/simmarket-vito`
- `%APPDATA%/simmarket-vito`

Si venís de builds anteriores, la app puede reutilizar datos ya existentes dentro de `simmarket-vito`.

Ahí se guardan, según el uso:

- `config.json`
- `state.json`
- `events.log`
- `price-history.json`
- caché de histórico externo por servidor

Los assets visuales, logos y catálogo vienen empaquetados dentro de la app.

## Desarrollo local

Requisitos:

- Node.js `20+`
- npm

```bash
npm install
npm run check
npm start
```

## Builds

```bash
npm run dist:mac
npm run dist:pkg
npm run dist:win
```

Scripts auxiliares:

- `run_simmarket.command`
- `build_simmarket_dmg.command`
- `build_simmarket_pkg.command`
- `build_simmarket_win.command`

## Validación del proyecto

```bash
npm run check
```

Ese chequeo valida:

- sintaxis de los archivos JS
- consistencia del catálogo de `142` activos
- presencia de logos
- consistencia mínima de scripts de empaquetado
- portabilidad de los launchers `.command`

## Estructura útil del proyecto

- [src/main/main.js](./src/main/main.js): proceso principal de Electron
- [src/main/monitor.js](./src/main/monitor.js): escaneo y lógica de alertas
- [src/main/storage.js](./src/main/storage.js): storage, migraciones y separación por servidor
- [src/renderer/index.html](./src/renderer/index.html): layout principal
- [src/renderer/app.js](./src/renderer/app.js): UI y comportamiento del panel
- [src/renderer/styles.css](./src/renderer/styles.css): estilos de la app
- [scripts/build-mac-installer.sh](./scripts/build-mac-installer.sh): build del instalador `.pkg`
- [scripts/check-project.js](./scripts/check-project.js): chequeos rápidos de consistencia

## Distribución

Artefactos principales:

- `SimMarket.app`
- `SimMarket-Installer-<version>-universal.pkg`
- `SimMarket-Installer-<version>-x64.exe`
- `SimMarket-<version>-universal.dmg`

## Estado de release

- La versión objetivo preparada en este repo es la `1.0.7`
- Los builds de macOS siguen saliendo sin firma ni notarización
- El instalador de Windows sigue sin certificado de firma de código

Eso no impide usar la app, pero sí puede generar advertencias de seguridad en la primera apertura.
