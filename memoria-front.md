# 🧠 Memoria Frontend - Ruleta Project

**Proyecto:** Frontend escalable con Next.js 15 + TypeScript  
**Autor:** Gabriel Beltrán  
**Fecha de inicio:** $(date)  
**Objetivo:** Sistema de memoria para mantener registro de desarrollo y decisiones técnicas

---

## 📋 Estado Actual del Proyecto

### 🏗️ Arquitectura Implementada
- **Framework:** Next.js 15 con App Router
- **Lenguaje:** TypeScript con configuración strict
- **Estilos:** CSS Modules + Tailwind CSS
- **Estado:** Redux Toolkit + RTK Query
- **Autenticación:** Sistema de auth con persistencia
- **UI Components:** Componentes reutilizables y escalables

### 📁 Estructura de Carpetas
```
src/
├── app/                    # App Router de Next.js 15
│   ├── dashboard/         # Panel de control
│   ├── deposit/           # Depósitos
│   ├── deposits/          # Historial de depósitos
│   ├── register/          # Registro de usuarios
│   └── roulette/          # Juego de ruleta (150, 300)
├── components/            # Componentes reutilizables
│   ├── auth/             # Componentes de autenticación
│   ├── dashboard/        # Componentes del dashboard
│   ├── deposit/          # Componentes de depósitos
│   ├── layout/           # Componentes de layout
│   ├── roulette/         # Componentes de ruleta
│   ├── sections/         # Secciones de página
│   └── ui/               # Componentes UI básicos
├── lib/                  # Utilidades y configuración
│   ├── api/              # Configuración de API
│   ├── services/         # Servicios externos
│   ├── store/            # Configuración de store
│   ├── utils/            # Utilidades generales
│   └── validations/      # Validaciones con Zod
├── store/                # Redux store
│   ├── api/              # RTK Query APIs
│   └── slices/           # Redux slices
├── styles/               # Estilos CSS Modules
│   ├── components/       # Estilos por componente
│   ├── layout/           # Estilos de layout
│   └── themes/           # Temas y variables
└── types/                # Definiciones de tipos TypeScript
```

---

## 🎯 Funcionalidades Implementadas

### ✅ Autenticación
- [x] Sistema de login/registro
- [x] Persistencia de sesión
- [x] Protección de rutas
- [x] Validaciones con Zod
- [x] Manejo de estados de carga

### ✅ Dashboard
- [x] Panel principal con métricas
- [x] Sidebar de navegación
- [x] Cards de KPIs
- [x] Feed de actividad
- [x] Acciones rápidas
- [x] Métricas de ruleta

### ✅ Sistema de Depósitos
- [x] Formulario de depósito USDT
- [x] Modal de depósito
- [x] Subida de comprobantes
- [x] Historial de depósitos
- [x] Integración con Cloudinary

### ✅ Juego de Ruleta
- [x] Ruleta visual con animaciones
- [x] Sistema de apuestas
- [x] Controles de juego
- [x] Resultados en tiempo real
- [x] SSE (Server-Sent Events)
- [x] Modal de ganadores profesionales
- [x] Selector de salas (150, 300)
- [x] Overlay de countdown
- [x] **Indicadores LED profesionales** - Sistema moderno de luces LED para señalar ganadores

---

## 🔧 Tecnologías y Librerías

### Core
- **Next.js 15** - Framework React con App Router
- **TypeScript** - Tipado estático
- **React 18** - Biblioteca de UI

### Estado y Datos
- **Redux Toolkit** - Manejo de estado global
- **RTK Query** - Cache y sincronización de datos
- **Zod** - Validación de esquemas

### Estilos
- **CSS Modules** - Estilos encapsulados
- **Tailwind CSS** - Framework de utilidades CSS

### Servicios Externos
- **Cloudinary** - Gestión de imágenes
- **Exchange Rate API** - Tasas de cambio

---

## 📝 Decisiones Técnicas Importantes

### 1. Arquitectura de Componentes
- **Server Components por defecto** - Mejor performance
- **Client Components solo cuando necesario** - Para hooks y APIs del navegador
- **Separación de responsabilidades** - Cada componente tiene una función específica

### 2. Manejo de Estado
- **Redux Toolkit** para estado global complejo
- **RTK Query** para cache de datos de API
- **Estado local** para componentes simples

### 3. Estilos
- **CSS Modules** para encapsulación
- **Tailwind** para utilidades rápidas
- **Variables CSS** para temas consistentes

### 4. TypeScript
- **Configuración strict** habilitada
- **Interfaces** en lugar de types para objetos
- **Type guards** en lugar de type casting
- **Tipos explícitos** en todas las funciones

---

## 🔧 Configuración del Proyecto

### 📦 Dependencias Principales
- **next:** ^15.0.0
- **react:** ^18.0.0
- **typescript:** ^5.0.0
- **@reduxjs/toolkit:** ^2.0.0
- **zod:** ^3.22.0
- **tailwindcss:** ^3.4.0

---

## 📊 Métricas del Proyecto

### Archivos de Código
- **Componentes:** ~25 componentes principales
- **Páginas:** 6 páginas principales
- **Hooks personalizados:** 8 hooks
- **Servicios:** 3 servicios externos
- **Tipos TypeScript:** Definiciones completas

### Estilos
- **CSS Modules:** 20+ archivos de estilos
- **Temas:** Sistema de colores y tipografía
- **Responsive:** Diseño mobile-first

---

## 🔗 Enlaces Útiles

### Documentación
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Herramientas
- [Tailwind CSS](https://tailwindcss.com/)
- [Zod Validation](https://zod.dev/)
- [Cloudinary](https://cloudinary.com/)

---

## 📅 Historial de Cambios

### 2024-12-19 - Inicialización del Sistema de Memoria
- ✅ Creación del sistema de memoria `memoria-front.md`
- ✅ Documentación completa de arquitectura actual
- ✅ Registro de todas las funcionalidades implementadas
- ✅ Lista detallada de tecnologías y librerías utilizadas
- ✅ Configuración de reglas en `.cursorrules` para mantenimiento automático
- ✅ Establecimiento de políticas anti-duplicación de código

### 2024-12-19 - Corrección de Configuración API
- ✅ Identificación de problema 404 en endpoint `/api/auth/login`
- ✅ Verificación de memoria backend (`memoria-backend.md`) - endpoint existe
- ✅ Implementación de configuración automática por entorno
- ✅ Función `getBaseURL()` con detección automática de desarrollo/producción
- ✅ Soporte para variables de entorno con fallback inteligente
- ✅ Desarrollo: `http://localhost:3001` | Producción: `https://ruleta-backend-12.onrender.com`
- ✅ Corrección de archivo `.env.local` que tenía `NEXT_PUBLIC_API_URL=http://localhost:3000`
- ✅ Configuración final: Frontend (3000) → Backend (3001) ✅
- ✅ Implementación de configuración automática sin variables de entorno
- ✅ Deploy a producción sin cambios manuales - completamente automático

---

*Esta memoria se actualizará con cada cambio significativo en el proyecto para mantener un registro completo del desarrollo.*
