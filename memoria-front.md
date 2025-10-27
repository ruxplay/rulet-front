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
│   ├── admin/             # Panel administrativo
│   ├── dashboard/         # Panel de control
│   ├── deposit/           # Depósitos
│   ├── deposits/          # Historial de depósitos
│   ├── register/          # Registro de usuarios
│   └── roulette/          # Juego de ruleta (150, 300)
├── components/            # Componentes reutilizables
│   ├── admin/             # Componentes administrativos
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminSidebar.tsx
│   │   ├── AdminHeader.tsx
│   │   ├── AdminContent.tsx
│   │   ├── UsersTable.tsx
│   │   └── index.ts
│   ├── auth/             # Componentes de autenticación
│   ├── dashboard/        # Componentes del dashboard
│   ├── deposit/          # Componentes de depósitos
│   ├── layout/           # Componentes de layout
│   ├── roulette/         # Componentes de ruleta
│   ├── sections/         # Secciones de página
│   ├── withdraw/         # Componentes de retiros
│   └── ui/               # Componentes UI básicos
├── lib/                  # Utilidades y configuración
│   ├── api/              # Configuración de API
│   ├── services/         # Servicios externos
│   ├── store/            # Configuración de store
│   ├── utils/            # Utilidades generales
│   └── validations/      # Validaciones con Zod
├── store/                # Redux store
│   ├── api/              # RTK Query APIs
│   │   ├── authApi.ts
│   │   ├── depositApi.ts
│   │   ├── rouletteApi.ts
│   │   ├── userApi.ts
│   │   ├── usersApi.ts
│   │   └── withdrawalApi.ts
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
- [x] **Pago Móvil** - Método de depósito rápido integrado

### ✅ Sistema de Retiros (Withdrawals)
- [x] Formulario de solicitud de retiro
- [x] Verificación de elegibilidad automática
- [x] Selección de métodos de pago permitidos
- [x] Validación de saldo disponible
- [x] Interfaz de balance y métodos de pago
- [x] Manejo de errores personalizados
- [x] Integración completa con API backend
- [x] Protección de ruta con autenticación
- [x] Diseño responsive y profesional

### ✅ Panel Administrativo
- [x] Dashboard administrativo completo
- [x] Sidebar de navegación admin
- [x] Header administrativo
- [x] Sistema de permisos por roles
- [x] Enlaces condicionales en Header/MobileMenu
- [x] Protección de rutas con `ProtectedPage`
- [x] **Gestión de Usuarios** - Listado, edición y eliminación de usuarios

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
- **Componentes:** ~35 componentes principales
- **Páginas:** 8 páginas principales
- **Hooks personalizados:** 8 hooks
- **Servicios:** 3 servicios externos
- **APIs RTK Query:** 6 APIs (auth, deposit, roulette, user, users, withdrawal)
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

### 2024-12-19 - Implementación Panel Administrativo
- ✅ Creación de página `/admin` con protección por roles
- ✅ Componentes administrativos: `AdminDashboard`, `AdminSidebar`, `AdminHeader`, `AdminContent`
- ✅ Sistema de navegación administrativa con sidebar
- ✅ Enlaces condicionales en Header y MobileMenu para usuarios admin
- ✅ Estilos CSS específicos para sección administrativa
- ✅ Protección de rutas con `ProtectedPage` usando `allowedRoles=['admin']`
- ✅ Diseño responsive para mobile, tablet y desktop
- ✅ Integración completa con sistema de autenticación existente
- ✅ **Corrección:** Agregado item "Retiros" en sidebar administrativo
- ✅ **Gestión de Usuarios:** Implementación completa de listado, edición y eliminación
- ✅ API `usersApi.ts` con RTK Query para operaciones CRUD de usuarios
- ✅ Componente `UsersTable` con funcionalidades administrativas completas
- ✅ Estilos CSS profesionales para tabla de usuarios con diseño responsive
- ✅ Integración con endpoints del backend (`GET /api/users`, `PUT /api/users/:id`, `DELETE /api/users/:id`)
- ✅ **Documentación Endpoint Eliminación:** Documentación profesional del endpoint `DELETE /api/users/delete/:id`

### 2024-12-19 - Corrección de Errores de Build TypeScript
- ✅ **Error corregido:** Propiedades de withdrawals faltantes en `AdminDashboard`
- ✅ Agregado `totalWithdrawals`, `pendingWithdrawals`, `approvedWithdrawals`, `rejectedWithdrawals`, `totalWithdrawalAmount` al tipo `stats` de `AdminDashboard`
- ✅ Actualizado tipo `WithdrawalStats` en `WithdrawalsTable` para incluir `totalWithdrawalAmount`
- ✅ Corregido cálculo de estadísticas en `WithdrawalsTable` para incluir propiedad `totalWithdrawalAmount`
- ✅ Actualizado uso de `totalWithdrawalAmount` en página `/admin/withdrawals`
- ✅ Build completado exitosamente sin errores de TypeScript
- ✅ **Archivos modificados:** `AdminDashboard.tsx`, `WithdrawalsTable.tsx`, `admin/withdrawals/page.tsx`

### 2024-12-19 - Implementación de Notificaciones en Tiempo Real con SSE
- ✅ **Actualizado tipo `UserBalanceUpdatedEvent`** para incluir campos completos del backend
- ✅ Agregado `wins`, `losses`, `depositId`, `depositAmount`, `betAmount` al payload del evento SSE
- ✅ Actualizado `reason` para incluir `'deposit_approved'` además de `'bet'`, `'spin_prize'`, `'withdrawal'`
- ✅ **Extendido hook `useRouletteSSE`** para actualizar `balance`, `wins` y `losses` desde un solo evento
- ✅ Implementado sistema de notificaciones con SweetAlert según el `reason`
- ✅ Notificación de éxito para depósitos aprobados
- ✅ Notificación informativa para apuestas realizadas
- ✅ Notificación de éxito para premios ganados
- ✅ Centralizado todo en `useRouletteSSE` sin duplicar funcionalidad
- ✅ **Cambio a Stream Unificado:** Actualizado endpoint SSE de `/api/roulette/150/stream` a `/api/roulette/stream` para recibir eventos de ambas ruletas + eventos de usuario (depósitos, apuestas, premios)
- ✅ **Probado y funcionando:** Sistema completo de actualización de balance en tiempo real con notificaciones implementado y verificado exitosamente

### 2024-12-19 - Actualización en Tiempo Real de Tabla de Depósitos para Admin
- ✅ **Agregado tipos SSE para depósitos** en `types/index.ts` (`DepositEventPayload`, `DepositCreatedEvent`, `DepositApprovedEvent`, `DepositRejectedEvent`)
- ✅ **Extendido hook `useRouletteSSE`** para escuchar eventos de depósitos desde el stream unificado
- ✅ Implementado listener `deposit.created` para notificar al admin de nuevos depósitos pendientes
- ✅ Implementado listener `deposit.approved` para actualizar tabla cuando se aprueba un depósito
- ✅ Implementado listener `deposit.rejected` para actualizar tabla cuando se rechaza un depósito
- ✅ **Invalidación automática de cache RTK Query** cuando llegan eventos de depósitos
- ✅ **Notificaciones solo para admin** (verifica role antes de mostrar)
- ✅ Notificación informativa para depósitos creados con detalles del usuario y monto
- ✅ Notificación de éxito cuando se aprueba un depósito
- ✅ Notificación de error cuando se rechaza un depósito
- ✅ **Centralizado SSE en `Header`** - El hook está en el componente global Header, funciona en TODAS las páginas
- ✅ **Escucha eventos en cualquier página de admin** - Funciona en `/admin`, `/admin/deposits`, `/admin/users`, `/admin/withdrawals`

### 2024-12-19 - Actualización en Tiempo Real de Tabla de Retiros para Admin
- ✅ **Agregado tipos SSE para retiros** en `types/index.ts` (`WithdrawalEventPayload`, `WithdrawalCreatedEvent`, `WithdrawalApprovedEvent`, `WithdrawalRejectedEvent`, `WithdrawalStatusChangedEvent`)
- ✅ **Extendido hook `useRouletteSSE`** para escuchar eventos de retiros desde el stream unificado
- ✅ Implementado listener `withdrawal.created` para notificar al admin de nuevos retiros pendientes
- ✅ Implementado listener `withdrawal.approved` para actualizar tabla cuando se aprueba un retiro
- ✅ Implementado listener `withdrawal.rejected` para actualizar tabla cuando se rechaza un retiro
- ✅ **Invalidación automática de cache RTK Query** cuando llegan eventos de retiros
- ✅ **Notificaciones solo para admin** (verifica role antes de mostrar)
- ✅ **Actualizado `UserBalanceUpdatedEvent`** para incluir `withdrawal_approved` y `withdrawal_rejected` con campos de retiro
- ✅ Notificaciones informativas para retiros creados con detalles del usuario y monto
- ✅ Notificación de éxito cuando se aprueba un retiro
- ✅ Notificación de error cuando se rechaza un retiro
- ✅ Notificaciones para usuarios cuando se aprueba/rechaza su retiro

### Archivos modificados
- ✅ `src/types/index.ts` - Tipos de eventos de retiros
- ✅ `src/components/roulette/hooks/useRouletteSSE.ts` - Listeners de eventos de retiros

---

## 📚 Documentación de Endpoints

### 🗑️ Eliminación de Usuario (Frontend)

#### 🔹 Información del Endpoint

| Propiedad       | Valor                                                                                                     |
| --------------- | --------------------------------------------------------------------------------------------------------- |
| **URL**         | `/api/users/delete/:id`                                                                                   |
| **Método**      | `DELETE`                                                                                                  |
| **Descripción** | Realiza una **eliminación lógica** del usuario (se marca como inactivo, no se borra de la base de datos). |

#### 🔹 Headers Requeridos

```http
Cookie: authToken=tu_jwt_token_aqui
Content-Type: application/json
```

#### 🔹 Parámetros de URL

| Parámetro | Tipo     | Descripción                           |
| --------- | -------- | ------------------------------------- |
| `id`      | `number` | ID del usuario que se desea eliminar. |

#### 🔹 Ejemplo de Request

```http
DELETE /api/users/delete/123
Cookie: authToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 🔹 Respuestas del Servidor

**✅ 200 - Éxito**
```json
{
  "message": "User deleted successfully"
}
```

**⚠️ 400 - Error de Validación**
```json
{
  "error": "Invalid user id"
}
```

**❌ 404 - Usuario No Encontrado**
```json
{
  "error": "User not found"
}
```

#### 🧠 Implementación en el Frontend

**1️⃣ Con Fetch API**
```javascript
async function deleteUser(userId) {
  try {
    const response = await fetch(`/api/users/delete/${userId}`, {
      method: 'DELETE',
      credentials: 'include', // Envía cookies automáticamente
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error || 'Error al eliminar usuario');
    return data;
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    throw error;
  }
}
```

**2️⃣ Uso en Componente React**
```jsx
const handleDeleteUser = async (userId) => {
  const confirmDelete = window.confirm('¿Seguro que deseas eliminar este usuario?');

  if (!confirmDelete) return;

  try {
    await deleteUser(userId);
    alert('✅ Usuario eliminado exitosamente');
    fetchUsers(); // Recarga la lista de usuarios activos
  } catch (error) {
    alert(`❌ Error: ${error.message}`);
  }
};
```

**3️⃣ Alternativa con Axios**
```javascript
import axios from 'axios';

const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(`/api/users/delete/${userId}`, {
      withCredentials: true // Envía las cookies del JWT
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || 'Error de conexión';
    throw new Error(message);
  }
};
```

#### 🧩 Eliminación Lógica: Concepto Clave

> ⚙️ El usuario **no se elimina físicamente** de la base de datos.

En su lugar:
- Se actualiza el campo `isActive` a `false`.
- Se conserva toda su información (historial, apuestas, transacciones).
- El usuario no puede iniciar sesión.
- Se mantiene la integridad y trazabilidad del sistema.

**💡 Ventajas**
- ✅ Auditoría completa
- ✅ Cumplimiento legal
- ✅ Posibilidad de reactivación
- ✅ Evita datos huérfanos
- ✅ Seguimiento histórico confiable

#### 🎨 Comportamiento en el Frontend

| Caso              | Resultado                                        |
| ----------------- | ------------------------------------------------ |
| Usuario eliminado | No aparece en la lista de activos                |
| Intento de login  | Bloqueado                                        |
| Historial y datos | Permanecen accesibles para reportes y auditorías |
| Reactivación      | Posible cambiando `isActive` a `true`            |

#### 🧭 Resumen Rápido

| Elemento          | Valor                                         |
| ----------------- | --------------------------------------------- |
| **Endpoint**      | `DELETE /api/users/delete/:id`                |
| **Autenticación** | Requiere cookie `authToken`                   |
| **Acción**        | Eliminación lógica (`isActive: false`)        |
| **Actualiza UI**  | Después del éxito, recargar lista de usuarios |

---

## 🔐 Validación de Usuarios Inactivos en Login

### 📋 Funcionalidad Implementada

**Problema:** Los usuarios con `isActive: false` podían intentar hacer login sin restricciones.

**Solución:** Validación automática del estado del usuario durante el proceso de login.

### 🔧 Implementación Técnica

#### 📍 Archivo: `src/components/layout/hooks/useAuth.ts`

```typescript
// Verificar si el usuario está activo
const isUserActive = user && typeof user === 'object' && 'isActive' in user 
  ? (user as Record<string, unknown>).isActive 
  : true; // Si no viene isActive, asumir que está activo

// Si el usuario está inactivo, mostrar error y no permitir login
if (isUserActive === false) {
  dispatch(clearUser());
  await showError('Usuario Inactivo', 'Tu cuenta ha sido desactivada. Contacta al administrador para más información.');
  setErrors({ general: 'Usuario inactivo' });
  return;
}
```

#### 📍 Archivo: `src/store/api/authApi.ts` - CORRECCIÓN CRÍTICA

**Problema encontrado:** El `onQueryStarted` del `authApi` ejecutaba `setUser` automáticamente sin validar `isActive`, permitiendo el acceso de usuarios inactivos.

**Solución implementada:**
```typescript
async onQueryStarted(arg, { dispatch, queryFulfilled }) {
  try {
    const { data } = await queryFulfilled;
    if (data?.user) {
      // Verificar si el usuario está activo antes de establecer el estado
      const user = data.user;
      const isUserActive = user && typeof user === 'object' && 'isActive' in user 
        ? (user as Record<string, unknown>).isActive 
        : true; // Si no viene isActive, asumir que está activo
      
      // Solo establecer el usuario si está activo
      if (isUserActive !== false) {
        dispatch(setUser(data.user as unknown as { id: number; username: string; email: string; fullName: string; role?: 'user' | 'admin'; balance?: number | string }));
      } else {
        // Si está inactivo, limpiar el estado y lanzar error
        dispatch(clearUser());
        throw new Error('Usuario inactivo');
      }
    }
  } catch {
    dispatch(clearUser());
  }
}
```

### 🎯 Comportamiento

| Estado del Usuario | Resultado del Login |
|-------------------|-------------------|
| `isActive: true` | ✅ Login exitoso, redirección al dashboard |
| `isActive: false` | ❌ Toast rojo: "Usuario Inactivo" (7 segundos) |
| `isActive: undefined` | ✅ Login exitoso (asume activo) |

### 🎨 Interfaz de Usuario

**Toast de Error:**
- **Posición:** Esquina inferior derecha
- **Título:** "Usuario Inactivo"
- **Mensaje:** "Tu cuenta ha sido desactivada. Contacta al administrador para más información."
- **Color:** Rojo (`#ef4444`)
- **Duración:** 7 segundos
- **Auto-cierre:** Sí
- **Botón de cierre:** X en la esquina superior derecha

### 🔄 Flujo Completo

1. **Usuario inactivo intenta login**
2. **Backend devuelve usuario con `isActive: false`**
3. **Frontend detecta estado inactivo**
4. **Se muestra toast rojo en esquina inferior derecha**
5. **Toast se auto-cierra después de 7 segundos**
6. **No se permite acceso al sistema**
7. **Usuario permanece en página de login**

### ✅ Beneficios

- **🔒 Seguridad:** Previene acceso no autorizado
- **👤 UX:** Mensaje claro sobre el estado de la cuenta
- **🔄 Consistencia:** Alineado con sistema de eliminación lógica
- **📱 Responsive:** Toast funciona en móvil y desktop
- **⏱️ No intrusivo:** Toast no bloquea la interfaz
- **🎨 Moderno:** Diseño limpio y profesional

---

## 🍞 Sistema de Toasts

### 📋 Funcionalidad Implementada

**Sistema de notificaciones toast** para reemplazar SweetAlert en casos específicos donde se requiere una experiencia menos intrusiva.

### 🔧 Implementación Técnica

#### 📍 Archivos Creados:

1. **`src/hooks/useToast.ts`** - Hook personalizado para manejar toasts
2. **`src/components/ui/Toast.tsx`** - Componente de toast individual
3. **`src/components/ui/ToastProvider.tsx`** - Context provider global

#### 📍 Características:

- **Posición:** Esquina inferior derecha
- **Duración:** 7 segundos por defecto (configurable)
- **Tipos:** Success, Error, Warning, Info
- **Auto-cierre:** Sí, con timer
- **Cierre manual:** Botón X
- **Responsive:** Funciona en móvil y desktop
- **Animaciones:** Transiciones suaves
- **Accesibilidad:** Screen reader friendly

### 🎨 Diseño Visual

```css
/* Toast de Error */
border-left: 4px solid #ef4444;
background: white;
shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
border-radius: 0.5rem;
```

### 🔄 Uso en el Proyecto

```typescript
// En cualquier componente
const { showError, showSuccess, showWarning, showInfo } = useToastContext();

// Ejemplo de uso
showError('Usuario Inactivo', 'Tu cuenta ha sido desactivada.', 7000);
```

### ✅ Ventajas sobre SweetAlert

- **🚫 No bloquea la interfaz** - El usuario puede seguir interactuando
- **⏱️ Auto-cierre** - No requiere acción del usuario
- **📱 Mejor UX móvil** - No ocupa toda la pantalla
- **🎨 Más moderno** - Diseño más limpio y profesional
- **🔄 Reutilizable** - Sistema escalable para toda la app

---

## 💰 Sistema de Gestión de Depósitos (Admin)

### 📅 **Fecha de Implementación:** 2025-01-22

### 🎯 **Objetivo**
Crear un sistema completo de gestión de depósitos para administradores, permitiendo revisar, aprobar, rechazar y gestionar todas las solicitudes de depósito de los usuarios.

### 🏗️ **Arquitectura Implementada**

#### 📍 **Página Principal:**
- **Ruta:** `/admin/deposits`
- **Archivo:** `src/app/admin/deposits/page.tsx`
- **Protección:** Solo administradores (`allowedRoles: ['admin']`)

#### 📍 **API Slice:**
- **Archivo:** `src/store/api/adminDepositsApi.ts`
- **Base URL:** `/api/deposits`
- **Endpoints disponibles:**
  - `GET /all` - Obtener todos los depósitos con filtros
  - `GET /pending` - Obtener depósitos pendientes
  - `GET /stats` - Obtener estadísticas de depósitos
  - `PUT /:id/status` - Actualizar estado de depósito
  - `GET /:id` - Obtener depósito por ID

#### 📍 **Componente Principal:**
- **Archivo:** `src/components/admin/DepositsTable.tsx`
- **Funcionalidades:**
  - Tabla completa de depósitos
  - Filtros por estado (todos, pendientes, aprobados, rechazados, completados)
  - Búsqueda por usuario, nombre o referencia
  - Paginación
  - Modal de edición de estado
  - Visualización de comprobantes con miniatura
  - Modal de imagen completa del comprobante

### 🎨 **Características de la Interfaz**

#### 📊 **Estadísticas en Header:**
- **Depósitos totales** - Contador general
- **Pendientes** - Requieren revisión
- **Aprobados** - Ya procesados
- **Rechazados** - No aprobados
- **Monto total** - Suma de todos los depósitos

#### 🔍 **Filtros y Búsqueda:**
- **Búsqueda:** Por username, nombre completo o referencia
- **Filtro de estado:** Dropdown con todos los estados
- **Paginación:** 10 elementos por página

#### 📋 **Tabla de Depósitos:**
- **Columnas:** ID, Usuario, Monto, Referencia, Banco, Nombre, Estado, Fecha, Comprobante, Acciones
- **Estados visuales:** Badges con colores distintivos
- **Comprobante:** Miniatura de imagen (40x30px) en lugar de icono
- **Acciones:** Editar estado, Ver detalles completos

#### 🖼️ **Visualización de Comprobantes:**
- **Miniatura en tabla:** Imagen de 40x30px con hover y click para modal completo
- **Miniatura en modal:** Imagen de 120x80px con bordes redondeados
- **Interactividad:** Hover con efecto de escala y cambio de borde
- **Modal completo:** Click en cualquier miniatura abre imagen en pantalla completa
- **Fallback:** Si la imagen falla, muestra enlace "Ver Comprobante"
- **Responsive:** Adaptación automática en dispositivos móviles (35x25px en móviles)

#### ✏️ **Modal de Edición:**
- **Cambio de estado:** Pendiente → Aprobado/Rechazado/Completado
- **Notas:** Campo opcional para comentarios
- **Confirmación:** SweetAlert antes de guardar

### 🎨 **Estilos CSS**

#### 📍 **Archivo:** `src/styles/components/deposits-table.css`

**Características visuales:**
- **Tema oscuro** con fondo `#1a1a1a`
- **Estados con colores:**
  - Pendiente: `#ffc107` (amarillo)
  - Aprobado: `#28a745` (verde)
  - Rechazado: `#dc3545` (rojo)
  - Completado: `#007bff` (azul)
- **Hover effects** en filas y botones
- **Responsive design** para móvil
- **Modal overlay** con backdrop blur

### 🔧 **Integración con Sistema Existente**

#### 📍 **AdminDashboard Actualizado:**
- **Interfaz:** Soporte para estadísticas de depósitos
- **Props:** `totalDeposits`, `pendingDeposits`, `approvedDeposits`, `rejectedDeposits`, `totalAmount`

#### 📍 **AdminHeader Actualizado:**
- **Renderizado condicional:** Muestra estadísticas de usuarios o depósitos según la página
- **Formateo de moneda:** VES con formato localizado

#### 📍 **Store Integration:**
- **Redux Store:** `adminDepositsApi` agregado al store principal
- **Middleware:** Configurado para RTK Query
- **Cache:** Invalidación automática al actualizar estados

### 🔄 **Flujo de Trabajo**

1. **Admin accede** a `/admin/deposits`
2. **Sistema carga** todos los depósitos con estadísticas
3. **Admin puede:**
   - Filtrar por estado
   - Buscar por usuario/referencia
   - Ver comprobantes (nueva ventana)
   - Cambiar estado de depósitos
   - Agregar notas de procesamiento
4. **Cambios se reflejan** inmediatamente en la interfaz

### 🛡️ **Seguridad y Validación**

- **Autenticación:** Requiere rol de administrador
- **Validación de tipos:** TypeScript estricto
- **Manejo de errores:** Try-catch con mensajes descriptivos
- **Confirmaciones:** SweetAlert antes de cambios críticos

### 📱 **Responsive Design**

- **Desktop:** Tabla completa con todas las columnas
- **Tablet:** Tabla con scroll horizontal
- **Móvil:** Columnas adaptadas, botones más grandes
- **Modal:** Responsive en todos los dispositivos

### 🔗 **Endpoints del Backend Utilizados**

Según `memoria-backend.md`:
- `GET /api/deposits/all` - Con filtros opcionales
- `GET /api/deposits/pending` - Solo pendientes
- `GET /api/deposits/stats` - Estadísticas
- `PUT /api/deposits/:id/status` - Actualizar estado

### ✅ **Estado de Implementación**

- ✅ **Página creada** (`/admin/deposits`)
- ✅ **API slice implementado** (`adminDepositsApi`)
- ✅ **Componente DepositsTable** con todas las funcionalidades
- ✅ **Estilos CSS** completos y responsive
- ✅ **Integración con AdminDashboard** y AdminHeader
- ✅ **Store configurado** correctamente
- ✅ **Sin errores de linting**

### 🚀 **Próximos Pasos Sugeridos**

1. **Implementar notificaciones** en tiempo real para nuevos depósitos
2. **Agregar exportación** de datos a Excel/PDF
3. **Implementar filtros avanzados** por fecha y monto
4. **Agregar historial de cambios** de estado
5. **Crear dashboard de métricas** de depósitos

---

## 💸 Sistema de Retiros (Withdrawals) - Implementación Completa

### 📅 **Fecha de Implementación:** 2025-01-22

### 🎯 **Objetivo**
Crear un sistema completo de retiros para que los usuarios puedan transferir sus ganancias a sus cuentas bancarias, con validación de elegibilidad y métodos de pago permitidos.

### 🏗️ **Arquitectura Implementada**

#### 📍 **Página Principal:**
- **Ruta:** `/withdraw`
- **Archivo:** `src/app/withdraw/page.tsx`
- **Protección:** Requiere autenticación (`ProtectedPage`)

#### 📍 **API Slice:**
- **Archivo:** `src/store/api/withdrawalApi.ts`
- **Base URL:** `/api/withdrawals`
- **Endpoints disponibles:**
  - `POST /api/withdrawals/request` - Crear solicitud de retiro
  - `GET /api/withdrawals/eligibility/:username` - Verificar elegibilidad
  - `GET /api/withdrawals/allowed-methods/:username` - Obtener métodos permitidos
  - `GET /api/withdrawals/user/:username` - Obtener retiros del usuario

#### 📍 **Componente Principal:**
- **Archivo:** `src/components/withdraw/WithdrawForm.tsx`
- **Funcionalidades:**
  - Formulario completo de solicitud de retiro
  - Verificación automática de elegibilidad
  - Selección de métodos de pago permitidos
  - Validación de saldo disponible
  - Manejo de errores personalizados

### 🎨 **Características de la Interfaz**

#### 📊 **Información de Balance:**
- **Balance disponible** - Muestra el saldo que se puede retirar
- **Nota informativa** - Explica que solo se puede retirar ganancias y el monto mínimo

#### 🎯 **Formulario de Solicitud:**
- **Método de pago** - Dropdown con métodos permitidos según historial de depósitos
- **Monto** - Input numérico con validación de mínimo (150 RUB) y máximo (balance disponible)
- **Cédula** - Campo de texto con validación de longitud
- **Teléfono** - Campo de teléfono con formato
- **Banco** - Campo de texto para especificar banco destino

#### ✅ **Validaciones:**
- **Monto mínimo:** 150 RUB
- **Monto máximo:** Balance disponible
- **Cédula:** 6-20 caracteres
- **Teléfono:** 10-20 dígitos
- **Banco:** 3+ caracteres
- **Método de pago:** Requerido

#### 🚨 **Errores Personalizados:**
- `USER_NOT_FOUND` - Usuario no encontrado
- `NO_WINS_TO_WITHDRAW` - No tienes ganancias para retirar
- `INSUFFICIENT_FUNDS` - Saldo insuficiente
- `MINIMUM_AMOUNT_NOT_MET` - El monto mínimo es 150 RUB
- `PENDING_WITHDRAWAL_EXISTS` - Ya tienes un retiro pendiente
- `PAYMENT_METHOD_NOT_ALLOWED` - Método de pago no permitido

### 🎨 **Estilos CSS**

#### 📍 **Archivo:** `src/styles/components/withdraw-form.css`

**Características visuales:**
- **Tema oscuro** con fondo gradient
- **Card informativa** con borde verde (#00FF9C)
- **Formulario** con inputs estilizados
- **Botón de envío** con gradiente verde
- **Estados de carga** con spinner
- **Mensajes de error** con fondo rojo translúcido
- **Responsive design** para todos los dispositivos

### 🔧 **Integración con Sistema Existente**

#### 📍 **Store Integration:**
- **Redux Store:** `withdrawalApi` agregado al store principal
- **Middleware:** Configurado para RTK Query
- **Cache:** Invalidación automática al crear retiros

#### 📍 **Tipos TypeScript:**
- `Withdrawal` - Interface completa del retiro
- `WithdrawalPaymentMethod` - Tipo enum: 'usdt' | 'bank_transfer' | 'pago_movil'
- `WithdrawalStatus` - Tipo enum: 'pending' | 'approved' | 'rejected'
- `WithdrawalEligibilityResponse` - Respuesta de elegibilidad
- `CreateWithdrawalRequest` - Request para crear retiro

### 🔄 **Flujo de Trabajo**

1. **Usuario accede** a `/withdraw`
2. **Sistema verifica elegibilidad** automáticamente
3. **Si es elegible:**
   - Muestra balance disponible
   - Carga métodos de pago permitidos según depósitos previos
   - Muestra solo los métodos que el usuario usó para depositar
   - Usuario completa formulario
   - Envía solicitud
   - Sistema bloquea saldo
4. **Si no es elegible:**
   - Muestra mensaje de error con razón

### 🛡️ **Seguridad y Validación**

- **Autenticación:** Requiere usuario autenticado
- **Validación de tipos:** TypeScript estricto
- **Manejo de errores:** Try-catch con mensajes descriptivos
- **Confirmaciones:** SweetAlert2 para éxito/error
- **Validación local:** Antes de enviar al servidor

### 📱 **Responsive Design**

- **Desktop:** Formulario completo con sidebar de balance
- **Tablet:** Layout adaptado
- **Móvil:** Formulario apilado verticalmente

### 🔗 **Endpoints del Backend Utilizados**

Según documentación proporcionada:
- `POST /api/withdrawals/request` - Crear retiro
- `GET /api/withdrawals/eligibility/:username` - Verificar elegibilidad
- `GET /api/withdrawals/allowed-methods/:username` - Métodos permitidos
- `GET /api/withdrawals/user/:username` - Historial de retiros

### ✅ **Estado de Implementación**

- ✅ **Tipos TypeScript** creados
- ✅ **API slice implementado** (`withdrawalApi`)
- ✅ **Componente WithdrawForm** completo
- ✅ **Página creada** (`/withdraw`)
- ✅ **Estilos CSS** completos y responsive
- ✅ **Store configurado** correctamente
- ✅ **Sin errores de linting**
- ✅ **Memoria actualizada**

### 🚀 **Lógica del Backend Implementada**

- ✅ El saldo se bloquea al solicitar el retiro (`pending`)
- ✅ Si es aprobado (`approved`): se resta del balance final
- ✅ Si es rechazado (`rejected`): se desbloquea y vuelve al balance disponible
- ✅ Solo se puede retirar si `wins > 0`
- ✅ Solo se permite un retiro pendiente por usuario
- ✅ **REGLA CRÍTICA:** El método de retiro depende de los métodos de depósito usados anteriormente
- ✅ Monto mínimo de 150 RUB
- ✅ Balance disponible = balance - blockedBalance

### 🔐 **Restricción de Métodos de Pago (REGLA CRÍTICA)**

El sistema **RESTRINGE** los métodos de retiro según el historial de depósitos:

| Depósitos del Usuario | Métodos de Retiro Permitidos |
|----------------------|-------------------------------|
| Solo `bank_transfer` | Solo `bank_transfer` |
| Solo `pago_movil` | Solo `pago_movil` |
| Solo `usdt` | Solo `usdt` |
| `bank_transfer` + `pago_movil` | Ambos métodos disponibles |
| `bank_transfer` + `usdt` | Ambos métodos disponibles |
| `pago_movil` + `usdt` | Ambos métodos disponibles |
| Los 3 métodos | Todos los métodos disponibles |

**⚠️ IMPORTANTE:** Solo puedes retirar por los métodos que usaste para depositar. El backend retorna `allowedMethods` que determina qué opciones se muestran en el dropdown.

---

*Esta memoria se actualizará con cada cambio significativo en el proyecto para mantener un registro completo del desarrollo.*
