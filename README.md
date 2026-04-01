# SimMarket

SimMarket es una app de escritorio para seguir el mercado de SimCompanies con una interfaz visual, alertas configurables, calculadora de costos y un flujo pensado para uso diario sin tocar archivos manualmente.

Repositorio oficial:
- [https://github.com/Vitosa0/simmarket](https://github.com/Vitosa0/simmarket)

## Qué incluye

- Alertas de mercado con escaneo manual y automático
- Selector completo de `142` activos agrupados por rubro
- Notificaciones locales en macOS
- Envío de alertas por Discord y Telegram
- Calculadora de costos con fee fijo del `4%`
- Registro interno de contactos
- Intro de marca integrada al arranque
- Instalador `.pkg` para macOS Apple Silicon
- Desinstalador incluido en la instalación

## Requisitos

- macOS Apple Silicon (`arm64`)
- Node.js `20+`
- npm

## Instalación para usar la app

Descargá el archivo:

- `SimMarket-Installer-1.0.0-arm64.pkg`

Después:

1. Abrí el installer.
2. Instalá `SimMarket.app` en `/Applications`.
3. El instalador crea también un acceso en el escritorio.
4. Para desinstalar, queda disponible:
   - `/Applications/Desinstalar SimMarket.command`

## Qué guarda localmente

La app crea y usa esta carpeta:

- `~/Library/Application Support/simmarket`

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
```

Scripts auxiliares:

- `run_simmarket.command`
- `build_simmarket_dmg.command`
- `build_simmarket_pkg.command`

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
- `SimMarket-Installer-<version>-arm64.pkg`
- `SimMarket-<version>-arm64.dmg`

## Estado actual

- El repo público ya está online en GitHub
- El instalador incluye desinstalador
- Los builds actuales están sin firma ni notarización de Apple

## Nota sobre macOS

Como la app todavía no está firmada ni notarizada, otras Macs pueden mostrar advertencias de seguridad al instalar o abrir la app por primera vez.
