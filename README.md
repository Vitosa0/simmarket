# SimMarket

SimMarket es una app de escritorio para seguir el mercado de SimCompanies con una interfaz visual, alertas configurables, calculadora de costos y un flujo pensado para uso diario sin tocar archivos manualmente.

Repositorio oficial:
- [https://github.com/Vitosa0/simmarket](https://github.com/Vitosa0/simmarket)

Release actual:
- [SimMarket v1.0.4](https://github.com/Vitosa0/simmarket/releases/tag/v1.0.4)

## Qué incluye

- Alertas de mercado con escaneo manual y automático
- Selector completo de `142` activos agrupados por rubro
- Notificaciones locales en macOS y Windows
- Envío de alertas por Discord y Telegram
- Calculadora de costos 
- Registro interno de contactos
- Instalador `.pkg` universal para macOS
- Instalador `.exe` para Windows x64
- Desinstalador incluido en la instalación

## Requisitos

- macOS (`universal`: Apple Silicon + Intel)
- Windows 10/11 (`x64`)
- Node.js `20+`
- npm

## Instalación para usar la app

macOS:

- [Installer `.pkg` universal](https://github.com/Vitosa0/simmarket/releases/download/v1.0.4/SimMarket-Installer-1.0.4-universal.pkg)
- [`.dmg` universal](https://github.com/Vitosa0/simmarket/releases/download/v1.0.4/SimMarket-1.0.4-universal.dmg)

1. Abrí el installer.
2. Instalá `SimMarket.app` en `/Applications`.
3. El instalador crea también un acceso en el escritorio.
4. Para desinstalar, queda disponible:
   - `/Applications/Desinstalar SimMarket.command`

Windows:

- [Installer `.exe` x64](https://github.com/Vitosa0/simmarket/releases/download/v1.0.4/SimMarket-Installer-1.0.4-x64.exe)

1. Abrí el installer.
2. Elegí la carpeta de instalación o usá la sugerida.
3. El instalador crea accesos de escritorio y menú inicio.
4. Para desinstalar, usá `Agregar o quitar programas` o el desinstalador incluido por el installer.

## Primera ejecución y advertencias de seguridad

Como los instaladores actuales no están firmados/notarizados, macOS y Windows pueden bloquear la primera apertura.

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

## Qué guarda localmente

La app crea y usa esta carpeta:

- `~/Library/Application Support/simmarket`
- `%APPDATA%/simmarket`

Ahí se guardan, según el uso:

- `config.json`
- `state.json`
- `events.log`

Los assets visuales, logos y catálogo vienen dentro de la app. No dependen de una carpeta externa de proyecto.

## Desarrollo

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
- scripts mínimos de `package.json`
- portabilidad de los launchers `.command`

## Estructura útil del proyecto

- [src/main/main.js](src/main/main.js): proceso principal de Electron
- [src/main/monitor.js](src/main/monitor.js): escaneo y lógica de alertas
- [src/renderer/index.html](src/renderer/index.html): layout principal
- [src/renderer/app.js](src/renderer/app.js): UI y comportamiento del panel
- [src/renderer/styles.css](src/renderer/styles.css): estilos de la app
- [scripts/build-mac-installer.sh](scripts/build-mac-installer.sh): build del installer
- [scripts/pkg/uninstall-simmarket.command](scripts/pkg/uninstall-simmarket.command): desinstalador distribuido con la app

## Distribución

Artefactos principales:

- `SimMarket.app`
- `SimMarket-Installer-<version>-universal.pkg`
- `SimMarket-Installer-<version>-x64.exe`
- `SimMarket-<version>-universal.dmg`

## Estado actual

- El repo público ya está online en GitHub
- El instalador incluye desinstalador
- Ya existe build de Windows x64
- Los builds actuales están sin firma ni notarización de Apple ni firma de código en Windows

## Nota sobre macOS

Como la app no está firmada ni notarizada, otras Macs pueden mostrar advertencias de seguridad al instalar o abrir la app por primera vez.

## Nota sobre Windows

Como el instalador de Windows no está firmado con certificado de código, Windows puede mostrar advertencias de SmartScreen según el equipo y la reputación del archivo.
