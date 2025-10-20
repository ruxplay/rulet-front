# 🧠 Memoria Backend - Sistema de Ruleta

## 📋 Información General

**Stack Tecnológico:**
- **Backend:** Node.js + Express + TypeScript
- **Base de Datos:** PostgreSQL + Sequelize ORM
- **Autenticación:** JWT con cookies HTTP-Only
- **Validación:** Zod schemas
- **Seguridad:** Helmet, CORS, bcrypt
- **Testing:** Vitest + Supertest

**Estructura del Proyecto:**
```
src/
├── routes/          # Endpoints de la API
├── controllers/     # Lógica HTTP (delgada)
├── services/        # Lógica de negocio
├── models/          # Modelos Sequelize
├── validators/       # Schemas Zod
├── middleware/       # Middlewares (auth, etc.)
├── config/          # Configuración DB
└── common/          # Constantes y utilidades
```

---

## 🔐 Autenticación y Usuarios

### **Modelo: SqlUser**
```typescript
interface IUserAttributes {
  id: number;
  username: string;           // Único, minúsculas
  email: string;              // Único, minúsculas, validado
  passwordHash: string;      // bcrypt
  fullName: string;
  phone?: string | null;
  balance: string;           // DECIMAL(18,2) - Saldo disponible
  blockedBalance: string;   // DECIMAL(18,2) - Saldo bloqueado por retiros
  wins: number;              // Contador de victorias
  losses: number;            // Contador de derrotas
  role: 'user'|'admin';
  lastLogin?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### **Endpoints de Autenticación**

#### `POST /api/auth/register`
**Descripción:** Registro de nuevos usuarios
**Request:**
```json
{
  "username": "usuario123",
  "email": "usuario@email.com",
  "password": "password123",
  "fullName": "Nombre Completo",
  "phone": "+584121234567"
}
```
**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "usuario123",
    "email": "usuario@email.com",
    "fullName": "Nombre Completo"
  }
}
```
**Validaciones:** Username y email únicos, email válido, password mínimo 6 caracteres

#### `POST /api/auth/login`
**Descripción:** Inicio de sesión con JWT
**Request:**
```json
{
  "username": "usuario123",  // o email
  "password": "password123"
}
```
**Response:**
```json
{
  "success": true,
  "user": { /* datos del usuario */ },
  "message": "Login successful"
}
```
**Cookies:** `authToken` HTTP-Only, 24h expiración

#### `GET /api/auth/verify`
**Descripción:** Verificar autenticación actual
**Headers:** Cookie `authToken`
**Response:**
```json
{
  "success": true,
  "user": { /* datos del usuario */ },
  "message": "User authenticated"
}
```

#### `POST /api/auth/logout`
**Descripción:** Cerrar sesión
**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### `GET /api/auth/usernames`
**Descripción:** Obtener usernames por email
**Query:** `?email=usuario@email.com`
**Response:**
```json
{
  "usernames": ["usuario1", "usuario2"]
}
```

### **Endpoints de Usuarios**

#### `GET /api/users`
**Descripción:** Obtener todos los usuarios (admin)
**Response:**
```json
{
  "users": [
    {
      "id": 1,
      "username": "usuario123",
      "email": "usuario@email.com",
      "fullName": "Nombre Completo",
      "balance": "1000.00",
      "blockedBalance": "0.00",
      "wins": 5,
      "losses": 3,
      "role": "user",
      "lastLogin": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### `GET /api/users/:username`
**Descripción:** Obtener usuario por username
**Response:**
```json
{
  "user": { /* datos del usuario */ }
}
```

#### `PUT /api/users/:id`
**Descripción:** Actualizar usuario
**Request:**
```json
{
  "user": {
    "username": "nuevo_usuario",
    "email": "nuevo@email.com",
    "fullName": "Nuevo Nombre",
    "phone": "+584121234567",
    "balance": "1500.00",
    "wins": 10,
    "losses": 5,
    "role": "user"
  }
}
```

#### `DELETE /api/users/:id`
**Descripción:** Eliminar usuario
**Response:**
```json
{
  "message": "User deleted successfully"
}
```

---

## 💰 Sistema de Depósitos

### **Modelo: Deposit**
```typescript
interface DepositAttributes {
  id: number;
  username: string;
  fullName?: string | null;
  amount: number;                    // DECIMAL(18,2)
  reference: string;                 // Referencia del pago
  bank: string;                      // Banco origen
  receiptUrl: string;                // URL del comprobante
  receiptPublicId: string;           // ID público del comprobante
  receiptFormat: string;             // Formato del archivo
  receiptBytes: number;              // Tamaño del archivo
  status: 'pending'|'approved'|'rejected'|'completed';
  paymentMethod: 'bank_transfer'|'usdt';
  usdtAmount?: number | null;        // DECIMAL(18,8)
  exchangeRate?: number | null;     // DECIMAL(18,4)
  walletAddress?: string | null;
  transactionHash?: string | null;
  processedAt?: Date | null;
  processedBy?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### **Endpoints de Depósitos**

#### `POST /api/deposits`
**Descripción:** Crear solicitud de depósito
**Request:**
```json
{
  "username": "usuario123",
  "amount": 100.00,
  "reference": "REF123456",
  "bank": "Banco de Venezuela",
  "receiptUrl": "https://cloudinary.com/image.jpg",
  "receiptPublicId": "deposit_receipt_123",
  "receiptFormat": "jpg",
  "receiptBytes": 1024000,
  "paymentMethod": "bank_transfer"
}
```
**Response:**
```json
{
  "deposit": {
    "id": 1,
    "username": "usuario123",
    "amount": 100.00,
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### `GET /api/deposits/user/:username`
**Descripción:** Obtener depósitos de un usuario
**Response:**
```json
{
  "deposits": [
    {
      "id": 1,
      "username": "usuario123",
      "amount": 100.00,
      "status": "approved",
      "paymentMethod": "bank_transfer",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### `GET /api/deposits/pending`
**Descripción:** Obtener depósitos pendientes (admin)
**Response:**
```json
{
  "deposits": [/* depósitos pendientes */]
}
```

#### `GET /api/deposits/all`
**Descripción:** Obtener todos los depósitos con filtros (admin)
**Query Parameters:**
- `status`: Estado del depósito
- `username`: Username específico
- `dateFrom`: Fecha desde (ISO)
- `dateTo`: Fecha hasta (ISO)

#### `PUT /api/deposits/:id/status`
**Descripción:** Actualizar estado de depósito (admin)
**Request:**
```json
{
  "status": "approved",
  "processedBy": "admin_user",
  "notes": "Depósito verificado correctamente"
}
```

#### `GET /api/deposits/test-usdt-rate`
**Descripción:** Probar cálculo de tasa USDT
**Response:**
```json
{
  "message": "Tasa USDT obtenida correctamente",
  "currentRate": {
    "rate": 36.25,
    "source": "binance",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "testCalculation": {
    "usdtAmount": 10,
    "exchangeRate": 36.25,
    "calculatedAmount": 362.50,
    "formula": "10 USDT × 36.25 BS/USDT = 362.50 BS"
  }
}
```

---

## 💸 Sistema de Retiros

### **Modelo: Withdrawal**
```typescript
interface WithdrawalAttributes {
  id: number;
  username: string;
  cedula: string;                    // Cédula de identidad
  telefono: string;                  // Teléfono de contacto
  banco: string;                     // Banco destino
  monto: number;                     // DECIMAL(10,2)
  payment_method: 'usdt'|'bank_transfer'|'quick_transfer';
  status: 'pending'|'approved'|'rejected'|'completed';
  processedAt?: Date;
  processedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### **Endpoints de Retiros**

#### `POST /api/withdrawals/request`
**Descripción:** Crear solicitud de retiro
**Request:**
```json
{
  "username": "usuario123",
  "cedula": "V-12345678",
  "telefono": "+584121234567",
  "banco": "Banesco",
  "monto": 500.00,
  "payment_method": "bank_transfer"
}
```
**Response:**
```json
{
  "withdrawal": {
    "id": 1,
    "username": "usuario123",
    "monto": 500.00,
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```
**Validaciones:** 
- Usuario debe tener saldo suficiente
- Solo se puede retirar de ganancias (`wins > 0`)
- Monto mínimo configurado
- No puede tener retiros pendientes

#### `GET /api/withdrawals/user/:username`
**Descripción:** Obtener retiros de un usuario
**Response:**
```json
{
  "withdrawals": [
    {
      "id": 1,
      "username": "usuario123",
      "monto": 500.00,
      "status": "completed",
      "payment_method": "bank_transfer",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### `GET /api/withdrawals/pending`
**Descripción:** Obtener retiros pendientes (admin)
**Response:**
```json
{
  "withdrawals": [/* retiros pendientes */]
}
```

#### `GET /api/withdrawals/all`
**Descripción:** Obtener todos los retiros con filtros (admin)
**Query Parameters:** `status`, `username`, `dateFrom`, `dateTo`

#### `PUT /api/withdrawals/:id/status`
**Descripción:** Actualizar estado de retiro (admin)
**Request:**
```json
{
  "status": "approved",
  "processedBy": "admin_user",
  "notes": "Retiro procesado exitosamente"
}
```

#### `GET /api/withdrawals/eligibility/:username`
**Descripción:** Verificar elegibilidad de retiro
**Response:**
```json
{
  "eligible": true,
  "availableBalance": 1000.00,
  "blockedBalance": 0.00,
  "totalWins": 5,
  "totalLosses": 3,
  "pendingWithdrawals": 0,
  "minimumAmount": 50.00,
  "canWithdraw": true,
  "reason": null
}
```

#### `GET /api/withdrawals/allowed-methods/:username`
**Descripción:** Obtener métodos de pago permitidos
**Response:**
```json
{
  "allowedMethods": [
    {
      "method": "bank_transfer",
      "enabled": true,
      "description": "Transferencia bancaria"
    },
    {
      "method": "usdt",
      "enabled": true,
      "description": "USDT"
    }
  ]
}
```

---

## 🎰 Sistema de Ruleta

### **Modelos de Ruleta**

#### **RouletteMesa**
```typescript
interface RouletteMesaAttributes {
  id: string;                        // UUID único
  type: '150'|'300';                 // Tipo de ruleta
  status: 'open'|'spinning'|'closed'|'waiting_for_result';
  filledCount: number;               // Sectores ocupados (0-15)
  spinning: boolean;                 // En proceso de giro
  active: boolean;                   // Mesa activa
  houseEarnings: string;             // DECIMAL(18,2) - Ganancias de la casa
  seed?: string | null;              // Semilla para el giro
  finalRotation?: string | null;     // DECIMAL(18,8) - Rotación final
  normalizedRotation?: string | null; // DECIMAL(18,8) - Rotación normalizada
  winnersJson?: object | null;       // JSON con ganadores
  createdAt: Date;
  updatedAt: Date;
}
```

#### **RouletteBet**
```typescript
interface RouletteBetAttributes {
  id: number;
  mesaId: string;                    // ID de la mesa
  type: '150'|'300';                 // Tipo de ruleta
  username: string;                  // Usuario que apuesta
  sectorIndex: number;               // Índice del sector (0-14)
  bet: string;                       // DECIMAL(18,2) - Monto apostado
  createdAt: Date;
  updatedAt: Date;
}
```

#### **RouletteControl**
```typescript
interface RouletteControlAttributes {
  type: '150'|'300';                 // Tipo de ruleta (PK)
  currentMesaId: string | null;      // Mesa actual activa
  nextMesaId: string | null;         // Próxima mesa
  createdAt: Date;
  updatedAt: Date;
}
```

### **Endpoints de Ruleta**

#### `GET /api/roulette/:type/current`
**Descripción:** Obtener mesa actual de ruleta
**Path:** `type` = '150' o '300'
**Response:**
```json
{
  "mesa": {
    "id": "mesa_150_001",
    "type": "150",
    "status": "open",
    "filledCount": 8,
    "spinning": false,
    "active": true,
    "houseEarnings": "0.00",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### `POST /api/roulette/:type/bet`
**Descripción:** Realizar apuesta en ruleta
**Request:**
```json
{
  "username": "usuario123",
  "sectorIndex": 5,
  "bet": 150.00
}
```
**Response:**
```json
{
  "success": true,
  "bet": {
    "id": 1,
    "mesaId": "mesa_150_001",
    "username": "usuario123",
    "sectorIndex": 5,
    "bet": "150.00"
  },
  "mesa": {
    "id": "mesa_150_001",
    "filledCount": 9,
    "status": "open"
  }
}
```
**Validaciones:**
- Usuario debe tener saldo suficiente
- Mesa debe estar abierta (`status: 'open'`)
- Sector no puede estar ocupado
- Usuario no puede apostar dos veces en la misma mesa
- Monto debe ser exacto según el tipo (150 o 300)

#### `POST /api/roulette/:type/spin`
**Descripción:** Iniciar giro de la ruleta
**Request:**
```json
{
  "mesaId": "mesa_150_001"
}
```
**Response:**
```json
{
  "success": true,
  "mesa": {
    "id": "mesa_150_001",
    "status": "spinning",
    "spinning": true,
    "seed": "random_seed_123"
  }
}
```

#### `POST /api/roulette/:type/submit-result`
**Descripción:** Enviar resultado del giro
**Request:**
```json
{
  "mesaId": "mesa_150_001",
  "winningSector": 5,
  "operatorId": "admin_user"
}
```
**Response:**
```json
{
  "success": true,
  "result": {
    "mesaId": "mesa_150_001",
    "winningSector": 5,
    "winners": [
      {
        "username": "usuario123",
        "sectorIndex": 5,
        "bet": "150.00",
        "payout": "1350.00"
      }
    ],
    "houseEarnings": "150.00"
  }
}
```

#### `POST /api/roulette/:type/advance`
**Descripción:** Avanzar a la siguiente mesa
**Request:**
```json
{
  "mesaId": "mesa_150_001"
}
```

#### `GET /api/roulette/:type/report`
**Descripción:** Reporte de ganancias de la casa
**Query Parameters:** `dateFrom`, `dateTo`
**Response:**
```json
{
  "type": "150",
  "dateFrom": "2024-01-01T00:00:00Z",
  "dateTo": "2024-01-15T23:59:59Z",
  "totalHouse": 5000.00,
  "mesas": 25
}
```

#### `GET /api/roulette/:type/winners`
**Descripción:** Últimos ganadores por mesa
**Query Parameters:** `limit` (default: 10)
**Response:**
```json
{
  "mesas": [
    {
      "mesaId": "mesa_150_001",
      "type": "150",
      "closedAt": "2024-01-15T10:30:00Z",
      "winners": [
        {
          "username": "usuario123",
          "sectorIndex": 5,
          "bet": "150.00",
          "payout": "1350.00"
        }
      ],
      "houseEarnings": 150.00
    }
  ]
}
```

#### `POST /api/roulette/:type/test-winners`
**Descripción:** Probar cálculo de sectores ganadores
**Request:**
```json
{
  "winningSector": 5
}
```
**Response:**
```json
{
  "winningSector": 5,
  "mainIndex": 5,
  "leftIndex": 4,
  "rightIndex": 6,
  "explanation": {
    "message": "Cálculo de sectores vecinos del backend",
    "main": "Sector principal: 5",
    "left": "Sector izquierdo: 4",
    "right": "Sector derecho: 6"
  }
}
```

### **Server-Sent Events (SSE)**

#### `GET /api/roulette/:type/stream`
**Descripción:** Stream de eventos en tiempo real por tipo
**Headers:** `Accept: text/event-stream`
**Eventos:**
- `snapshot`: Estado inicial de la mesa
- `bet_placed`: Nueva apuesta realizada
- `spin_started`: Inicio de giro
- `result_submitted`: Resultado enviado
- `mesa_advanced`: Mesa avanzada

#### `GET /api/roulette/stream`
**Descripción:** Stream unificado para ambas ruletas (150 y 300)
**Response:**
```json
{
  "150": {
    "type": "150",
    "mesa": { /* mesa 150 */ }
  },
  "300": {
    "type": "300", 
    "mesa": { /* mesa 300 */ }
  }
}
```

---

## 💱 Sistema de Tasas USDT

### **Modelo: UsdtRate**
```typescript
interface UsdtRateAttributes {
  id: number;
  rate: number;                     // DECIMAL(18,4) - Tasa de cambio
  source: 'binance'|'coingecko'|'manual';
  status: 'active'|'inactive';
  createdAt: Date;
  updatedAt: Date;
}
```

### **Endpoints de Tasas USDT**

#### `GET /api/usdt-rates/current`
**Descripción:** Obtener tasa actual de USDT
**Response:**
```json
{
  "currentRate": {
    "id": 1,
    "rate": 36.25,
    "source": "binance",
    "status": "active",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "lastUpdated": "2024-01-15T10:30:00Z",
  "isStale": false
}
```

#### `GET /api/usdt-rates/history`
**Descripción:** Historial de tasas (admin)
**Query Parameters:** `limit`, `offset`, `source`, `status`
**Response:**
```json
{
  "rates": [
    {
      "id": 1,
      "rate": 36.25,
      "source": "binance",
      "status": "active",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### `POST /api/usdt-rates`
**Descripción:** Crear tasa manual (admin)
**Request:**
```json
{
  "rate": 36.50,
  "source": "manual"
}
```

#### `PUT /api/usdt-rates/:id`
**Descripción:** Actualizar tasa (admin)
**Request:**
```json
{
  "rate": 36.75,
  "status": "active"
}
```

#### `POST /api/usdt-rates/update-from-api`
**Descripción:** Forzar actualización desde APIs externas
**Response:**
```json
{
  "rate": {
    "id": 2,
    "rate": 36.30,
    "source": "binance",
    "status": "active"
  }
}
```

---

## ⚙️ Sistema de Configuración

### **Modelo: SystemConfig**
```typescript
interface SystemConfigAttributes {
  id: number;
  key: string;                      // Clave única
  value: string;                    // Valor como string
  description?: string | null;      // Descripción
  category: string;                 // Categoría
  dataType: 'string'|'number'|'boolean'|'json';
  isEditable: boolean;              // Si es editable
  validationRules?: string | null;  // Reglas de validación
  createdAt: Date;
  updatedAt: Date;
}
```

### **Endpoints de Configuración**

#### `GET /api/system-config`
**Descripción:** Obtener todas las configuraciones (admin)
**Query Parameters:** `category`, `isEditable`, `limit`, `offset`
**Response:**
```json
{
  "configs": [
    {
      "id": 1,
      "key": "min_withdrawal_amount",
      "value": "50.00",
      "description": "Monto mínimo para retiros",
      "category": "withdrawals",
      "dataType": "number",
      "isEditable": true
    }
  ]
}
```

#### `GET /api/system-config/:key`
**Descripción:** Obtener configuración por clave (admin)
**Response:**
```json
{
  "config": {
    "id": 1,
    "key": "min_withdrawal_amount",
    "value": "50.00",
    "description": "Monto mínimo para retiros",
    "category": "withdrawals",
    "dataType": "number",
    "isEditable": true
  }
}
```

#### `GET /api/system-config/:key/value`
**Descripción:** Obtener valor de configuración (público, parseado)
**Response:**
```json
{
  "key": "min_withdrawal_amount",
  "value": 50.00
}
```

#### `GET /api/system-config/category/:category`
**Descripción:** Obtener configuraciones por categoría
**Response:**
```json
{
  "category": "withdrawals",
  "configs": [/* configuraciones de retiros */]
}
```

#### `POST /api/system-config`
**Descripción:** Crear nueva configuración (admin)
**Request:**
```json
{
  "key": "max_bet_amount",
  "value": "1000.00",
  "description": "Monto máximo de apuesta",
  "category": "roulette",
  "dataType": "number",
  "isEditable": true
}
```

#### `PUT /api/system-config/:key`
**Descripción:** Actualizar configuración (admin)
**Request:**
```json
{
  "value": "75.00",
  "description": "Monto mínimo actualizado"
}
```

#### `PUT /api/system-config/bulk`
**Descripción:** Actualización masiva de configuraciones
**Request:**
```json
{
  "configs": [
    {
      "key": "min_withdrawal_amount",
      "value": "75.00"
    },
    {
      "key": "max_bet_amount", 
      "value": "1500.00"
    }
  ]
}
```

#### `DELETE /api/system-config/:key`
**Descripción:** Eliminar configuración (admin)
**Response:**
```json
{
  "message": "Configuration deleted successfully"
}
```

#### `GET /api/system-config/meta/categories`
**Descripción:** Obtener categorías disponibles
**Response:**
```json
{
  "categories": [
    "roulette",
    "withdrawals", 
    "deposits",
    "general"
  ]
}
```

---

## 🔧 Configuraciones del Sistema

### **Categorías de Configuración:**
- **`roulette`**: Configuraciones de ruleta (payouts, delays, etc.)
- **`withdrawals`**: Configuraciones de retiros (montos mínimos, métodos)
- **`deposits`**: Configuraciones de depósitos (límites, métodos)
- **`general`**: Configuraciones generales del sistema

### **Configuraciones Importantes:**
- `min_withdrawal_amount`: Monto mínimo para retiros
- `roulette_payout_multiplier`: Multiplicador de pagos (ej: 9x)
- `roulette_mesa_delay`: Delay entre mesas (segundos)
- `usdt_rate_update_interval`: Intervalo de actualización de tasas
- `max_bet_amount`: Monto máximo de apuesta
- `house_edge_percentage`: Porcentaje de ventaja de la casa

---

## 🛡️ Seguridad y Validaciones

### **Autenticación:**
- JWT tokens con cookies HTTP-Only
- Expiración de 24 horas
- Verificación en middleware `authenticateToken`
- Roles: `user` y `admin`

### **Validaciones Zod:**
- Todos los endpoints tienen schemas de validación
- Validación de tipos de datos
- Validación de rangos y formatos
- Mensajes de error estructurados

### **Seguridad:**
- Contraseñas encriptadas con bcrypt (10 rounds)
- Helmet para headers de seguridad
- CORS configurado
- Rate limiting implementado
- Sanitización de inputs

### **Manejo de Errores:**
- Errores tipados con códigos específicos
- Mensajes de error en español
- Logging estructurado
- Transacciones para operaciones críticas

---

## 📊 Relaciones entre Entidades

### **Usuarios ↔ Depósitos:**
- Un usuario puede tener múltiples depósitos
- Relación por `username`

### **Usuarios ↔ Retiros:**
- Un usuario puede tener múltiples retiros
- Relación por `username`
- Validación de saldo disponible

### **Usuarios ↔ Apuestas:**
- Un usuario puede tener múltiples apuestas
- Una apuesta por mesa por usuario
- Relación por `username`

### **Mesas ↔ Apuestas:**
- Una mesa puede tener múltiples apuestas
- Una apuesta por sector por mesa
- Relación por `mesaId`

### **Control ↔ Mesas:**
- Control de mesa actual y próxima
- Relación por `type` (150 o 300)

---

## 🚀 Funcionalidades Especiales

### **Sistema de Eventos en Tiempo Real:**
- Server-Sent Events (SSE) para actualizaciones en vivo
- Eventos de ruleta y usuario separados
- Reconexión automática
- Filtrado por tipo de ruleta

### **Sistema de Tasas USDT:**
- Actualización automática desde APIs externas (Binance, CoinGecko)
- Fallback a tasas manuales
- Historial de tasas
- Cálculo automático de conversiones

### **Sistema de Configuración Dinámico:**
- Configuraciones editables en tiempo real
- Categorización por módulos
- Validación de tipos de datos
- Actualización masiva

### **Sistema de Ruleta Avanzado:**
- Dos tipos de ruleta (150 y 300)
- 15 sectores por mesa
- Cálculo de ganadores con sectores vecinos
- Control de estado de mesas
- Generación de semillas aleatorias

---

## 📝 Notas de Desarrollo

### **Última Actualización:** 2024-01-15
### **Versión:** 1.0.0
### **Estado:** Producción

### **Próximas Mejoras:**
- Sistema de notificaciones push
- Dashboard de administración
- Reportes avanzados
- API de estadísticas
- Sistema de bonificaciones

### **Consideraciones Técnicas:**
- Todas las operaciones monetarias usan DECIMAL para precisión
- Transacciones de base de datos para operaciones críticas
- Índices optimizados para consultas frecuentes
- Caché de configuraciones del sistema
- Logging estructurado para debugging

---

*Este documento se mantiene actualizado automáticamente con cada cambio en el backend.*
