# Credenciales Universitarias Digitales (PWA)

Aplicación Web Progresiva (PWA) para visualización e interactividad de credenciales y carnés estudiantiles universitarios con fidelidad visual pixel-perfect, modo offline y reloj/fecha en tiempo real.

## 🚀 Características
- **Diseño Responsivo & Pixel-Perfect**: Reproducción exacta de la interfaz y estilos del carné digital.
- **Reloj y Fecha en Vivo**: Hora actualizada segundo a segundo y fecha del día en tiempo real.
- **Personalización Local**: Panel para editar nombres, carrera, estado, código y subir foto de perfil, con guardado automático en `localStorage`.
- **Progressive Web App (PWA)**: Soporte completo para instalación en Android, iOS y Escritorio (modo standalone) y funcionamiento offline mediante Service Worker.

## 📦 Estructura del Proyecto
- `index.html`: Estructura y componentes visuales.
- `app.js`: Lógica de interactividad, reloj, código de barras y almacenamiento.
- `manifest.json`: Manifiesto para instalación PWA.
- `sw.js`: Service worker para caché offline.
- `assets/`: Imágenes de perfil e iconos de la aplicación.
