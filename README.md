# SimMarket

Aplicación de escritorio para monitorear alertas de mercado de SimCompanies, con panel visual, selector completo de activos por rubro, calculadora de compra/venta y notificaciones locales o por Discord/Telegram.

## Qué incluye

- App de escritorio con Electron
- Selector de 142 activos agrupados por rubro
- Alertas de compra, venta o rango
- Escaneo manual y automático
- Notificaciones locales, Discord y Telegram
- Calculadora integrada con fee fijo del 4%
- Build de `.app`, `.dmg` y `.pkg`

## Requisitos

- macOS Apple Silicon (`arm64`)
- Node.js 20 o superior
- npm

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

También hay scripts auxiliares:

- `run_simmarket.command`
- `build_simmarket_dmg.command`
- `build_simmarket_pkg.command`

## Datos locales

La app guarda su configuración y estado en:

- `~/Library/Application Support/simmarket/config.json`
- `~/Library/Application Support/simmarket/state.json`
- `~/Library/Application Support/simmarket/events.log`

## Validación del proyecto

```bash
npm run check
```

Ese chequeo valida:

- sintaxis de todos los archivos JS del proyecto
- consistencia del catálogo de 142 activos
- existencia de logos
- scripts mínimos de `package.json`
- que los launchers `.command` no dependan de rutas locales hardcodeadas

## Distribución

- `SimMarket.app`: app lista para abrir
- `SimMarket-Installer-<version>-arm64.pkg`: instalador para `/Applications`

## Nota

Los builds actuales están sin firma ni notarización de Apple. En otras Macs, macOS puede mostrar advertencias de seguridad hasta que se firme el binario.
