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
  isActive: boolean;         // Eliminación lógica (true=activo, false=eliminado)
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
  "user": {
    "id": 1,
    "username": "usuario123",
    "email": "usuario@ejemplo.com",
    "fullName": "Usuario Ejemplo",
    "role": "user",
    "balance": "1000.00",
    "wins": 0,
    "losses": 0,
    "phone": "+584121234567",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastLogin": "2024-01-01T00:00:00.000Z"
  },
  "message": "Login successful"
}
```
**Cookies:** `authToken` HTTP-Only, 24h expiración, `sameSite: 'none'` para cross-domain
**Nota:** El campo `isActive` se incluye en la respuesta para que el frontend pueda manejar usuarios inactivos. El backend NO restringe el login por `isActive` - esta validación se maneja en el frontend.

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
**Descripción:** Obtener todos los usuarios (admin) - INCLUYE usuarios activos e inactivos
**Headers:** `Cookie: authToken=...` (requiere autenticación admin)
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
      "isActive": true,
      "lastLogin": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "username": "usuario_eliminado",
      "email": "eliminado@email.com",
      "fullName": "Usuario Eliminado",
      "balance": "500.00",
      "blockedBalance": "0.00",
      "wins": 2,
      "losses": 1,
      "role": "user",
      "isActive": false,
      "lastLogin": "2024-01-10T15:20:00Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-12T09:45:00Z"
    }
  ]
}
```
**Nota:** Este endpoint devuelve TODOS los usuarios (activos e inactivos) para que el admin pueda gestionarlos. El campo `isActive` indica el estado del usuario.

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
**Descripción:** Eliminación lógica de usuario (marca como inactivo)
**Headers:** `Cookie: authToken=...` (requiere autenticación admin)
**Response:**
```json
{
  "message": "User deleted successfully"
}
```
**Nota:** Este endpoint realiza eliminación lógica, estableciendo `isActive: false` en lugar de eliminar físicamente el registro. Esto preserva el historial de transacciones y permite auditoría.

#### `PUT /api/users/reactivate/:id`
**Descripción:** Reactivar usuario eliminado lógicamente (marca como activo)
**Headers:** `Cookie: authToken=...` (requiere autenticación admin)
**Response:**
```json
{
  "message": "User reactivated successfully"
}
```
**Nota:** Este endpoint reactiva un usuario que fue eliminado lógicamente, estableciendo `isActive: true`. Permite recuperar usuarios que fueron marcados como inactivos.

#### `GET /api/users/test/:id`
**Descripción:** Verificar si un usuario existe en la base de datos (para testing)
**Headers:** `Cookie: authToken=...` (requiere autenticación admin)
**Response:**
```json
{
  "exists": true,
  "user": {
    "id": 1,
    "username": "usuario123",
    "isActive": true
  }
}
```
**Nota:** Endpoint de testing para verificar la existencia de usuarios en la base de datos.

### **Eliminación Lógica de Usuarios**

El sistema implementa **eliminación lógica** para preservar la integridad de los datos:

- **Campo `isActive`:** `true` = usuario activo, `false` = usuario eliminado
- **Valor por defecto:** `true` al registrarse
- **Comportamiento:** 
  - `DELETE /api/users/:id` marca `isActive: false`
  - `PUT /api/users/reactivate/:id` marca `isActive: true`
  - `GET /api/users` devuelve TODOS los usuarios (activos e inactivos) para administración
  - Los usuarios inactivos pueden hacer login (validación en frontend)
  - Se preserva el historial de transacciones y relaciones

**Endpoints relacionados:**
- `DELETE /api/users/:id` - Eliminación lógica (marca como inactivo)
- `PUT /api/users/reactivate/:id` - Reactivación (marca como activo)
- `GET /api/users` - Lista todos los usuarios (activos e inactivos)

**Ventajas:**
- ✅ Preserva integridad referencial
- ✅ Mantiene historial de auditoría
- ✅ Cumple regulaciones financieras
- ✅ Permite recuperación de cuentas
- ✅ Evita datos huérfanos
- ✅ Reutiliza la misma lógica para activación/desactivación

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
  status: 'pending'|'approved'|'rejected';
  paymentMethod: 'bank_transfer'|'usdt'|'pago_movil';
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

#### **Estados de Depósito**
Los depósitos tienen 3 estados posibles:

| Estado | Descripción | Balance del Usuario |
|--------|-------------|-------------------|
| **`pending`** | Pendiente de revisión por admin | ❌ NO se modifica |
| **`approved`** | Aprobado y procesado | ✅ SE SUMA al balance |
| **`rejected`** | Rechazado por admin | ❌ NO se modifica |

**Flujo:** `pending` → `approved` (suma dinero) O `rejected` (no suma dinero)

#### **⚠️ Corrección Importante - Suma de Balance**
**Problema resuelto:** Se corrigió un bug crítico donde la suma del balance del usuario se realizaba como concatenación de strings en lugar de suma matemática.

**Causa:** Los campos `balance` y `amount` en la base de datos son de tipo `DECIMAL`, que Sequelize devuelve como strings, causando concatenación en lugar de suma.

**Solución implementada:**
```typescript
// ❌ ANTES (concatenación):
const newBalance = user.balance + deposit.amount; // "45295.28" + 14850.00 = "45295.2814850.00"

// ✅ AHORA (suma correcta):
const newBalance = parseFloat(user.balance) + parseFloat(deposit.amount.toString()); // 45295.28 + 14850.00 = 60145.28
```

---

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

**Ejemplo para Pago Móvil:**
```json
{
  "username": "usuario123",
  "amount": 150.00,
  "reference": "PM123456789",
  "bank": "Pago Móvil",
  "receiptUrl": "https://cloudinary.com/image.jpg",
  "receiptPublicId": "pago_movil_receipt_123",
  "receiptFormat": "jpg",
  "receiptBytes": 1024000,
  "paymentMethod": "pago_movil"
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
**Notificación en Tiempo Real:**
- Cuando se aprueba un depósito (`status: "approved"`), se emite evento `user.balance.updated` vía SSE
- El frontend recibe actualización automática del balance del usuario
- **Payload del evento:**
  ```json
  {
    "username": "usuario123",
    "balance": "1500.00",
    "losses": 500,
    "wins": 1000,
    "reason": "deposit_approved",
    "depositId": 42,
    "depositAmount": 500.00
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

> 📄 **Documentación detallada:** Ver archivo `retiros.mdx` en la raíz del proyecto para información completa de endpoints de administración.

### **Modelo: Withdrawal**
```typescript
interface WithdrawalAttributes {
  id: number;
  username: string;
  cedula: string;                    // Cédula de identidad
  telefono: string;                  // Teléfono de contacto
  banco: string;                     // Banco destino
  monto: number;                     // DECIMAL(10,2)
  payment_method: 'bank_transfer'|'usdt'|'pago_movil';
  status: 'pending'|'approved'|'rejected';
  processedAt?: Date;
  processedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### **Endpoints de Retiros**

#### **Estados de Retiro**
Los retiros tienen 3 estados posibles:

| Estado | Descripción | Balance del Usuario |
|--------|-------------|-------------------|
| **`pending`** | Pendiente de revisión por admin | 🔒 BLOQUEADO (no disponible) |
| **`approved`** | Aprobado y procesado | ✅ DESBLOQUEADO (se resta del balance) |
| **`rejected`** | Rechazado por admin | ✅ DESBLOQUEADO (vuelve al balance disponible) |

**Flujo:** `pending` → `approved` (resta dinero) O `rejected` (desbloquea dinero)

---

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
  "allowedMethods": ["bank_transfer", "usdt", "pago_movil"]
}
```

#### **REGLA IMPORTANTE: Métodos Permisibles según Depósitos del Usuario**

El backend **RESTRINGE** los métodos de retiro según los métodos de depósito que el usuario haya usado previamente:

| Depósitos del Usuario | Métodos de Retiro Permitidos |
|----------------------|-------------------------------|
| Solo `bank_transfer` | Solo `bank_transfer` |
| Solo `pago_movil` | Solo `pago_movil` |
| Solo `usdt` | Solo `usdt` |
| `bank_transfer` + `pago_movil` | `bank_transfer` Y `pago_movil` (puede elegir) |
| `bank_transfer` + `usdt` | `bank_transfer` Y `usdt` (puede elegir) |
| `pago_movil` + `usdt` | `pago_movil` Y `usdt` (puede elegir) |
| Los 3 métodos | `bank_transfer`, `usdt`, `pago_movil` (todos) |

**IMPORTANTE:** El usuario solo puede retirar por los métodos que usó para depositar.

---

### 📋 **GUÍA PARA FRONTEND: Implementación de Retiros**

#### **1. Flujo Recomendado al Abrir Modal de Retiro**

```typescript
// 1. Verificar elegibilidad ANTES de mostrar el modal
const checkEligibility = async (username: string) => {
  const response = await fetch(`/api/withdrawals/eligibility/${username}`);
  const data = await response.json();
  
  if (!data.eligible) {
    // Mostrar error al usuario según el motivo
    switch (data.reason) {
      case 'NO_WINS_TO_WITHDRAW':
        showError('Debes tener ganancias para retirar');
        return false;
      case 'PENDING_WITHDRAWAL_EXISTS':
        showError('Ya tienes un retiro pendiente');
        return false;
      default:
        showError('No puedes retirar en este momento');
        return false;
    }
  }
  
  return data;
};

// 2. Obtener métodos permitidos
const getAllowedMethods = async (username: string) => {
  const response = await fetch(`/api/withdrawals/allowed-methods/${username}`);
  const { allowedMethods } = await response.json();
  return allowedMethods; // Ejemplo: ["bank_transfer", "pago_movil"]
};
```

#### **2. Mostrar/Ocultar Métodos de Pago**

```typescript
// Enum con todos los métodos disponibles en el sistema
enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  USDT = 'usdt',
  PAGO_MOVIL = 'pago_movil'
}

// Traducir métodos a labels para UI
const paymentLabels = {
  'bank_transfer': 'Transferencia Bancaria',
  'usdt': 'USDT',
  'pago_movil': 'Pago Móvil'
};

// Función para renderizar opciones de pago
const renderPaymentMethods = (allowedMethods: string[]) => {
  // Solo mostrar los métodos que el backend permite
  return Object.entries(PaymentMethod).map(([key, value]) => {
    const isAllowed = allowedMethods.includes(value);
    const label = paymentLabels[value];
    
    return (
      <RadioButton
        key={value}
        value={value}
        disabled={!isAllowed}
        label={label}
        // Opcional: Mostrar mensaje si está deshabilitado
        helperText={!isAllowed ? 'Debes depositar primero con este método' : undefined}
      />
    );
  });
};
```

#### **3. Validación del Formulario de Retiro**

```typescript
const validateWithdrawalForm = (
  monto: number,
  allowedMethods: string[],
  selectedMethod: string
) => {
  const errors = [];
  
  // Validar monto mínimo
  if (monto < 150) {
    errors.push('El monto mínimo es 150 BS');
  }
  
  // Validar que el método seleccionado esté permitido
  if (!allowedMethods.includes(selectedMethod)) {
    errors.push('Método de pago no permitido');
  }
  
  return errors;
};
```

#### **4. Enviar Solicitud de Retiro**

```typescript
const submitWithdrawal = async (formData: {
  username: string;
  cedula: string;
  telefono: string;
  banco: string;
  monto: number;
  payment_method: string;
}) => {
  try {
    const response = await fetch('/api/withdrawals/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (response.status === 400) {
      const { error } = await response.json();
      
      // Manejar errores específicos
      switch (error) {
        case 'INSUFFICIENT_FUNDS':
          showError('Saldo insuficiente');
          break;
        case 'MINIMUM_AMOUNT_NOT_MET':
          showError('El monto mínimo es 150 BS');
          break;
        case 'PENDING_WITHDRAWAL_EXISTS':
          showError('Ya tienes un retiro pendiente');
          break;
        case 'PAYMENT_METHOD_NOT_ALLOWED':
          showError('Este método de pago no está disponible para ti');
          break;
        default:
          showError('Error al crear la solicitud de retiro');
      }
      return;
    }
    
    if (response.ok) {
      const { withdrawal } = await response.json();
      showSuccess('Solicitud de retiro creada exitosamente');
      // Actualizar UI: actualizar balance, mostrar retiro en lista
      return withdrawal;
    }
  } catch (error) {
    showError('Error de conexión');
  }
};
```

#### **5. Ejemplo Completo de Componente React**

```typescript
const WithdrawalModal = ({ username, onClose }) => {
  const [allowedMethods, setAllowedMethods] = useState<string[]>([]);
  const [eligibility, setEligibility] = useState(null);
  const [formData, setFormData] = useState({
    payment_method: '',
    monto: 0,
    cedula: '',
    telefono: '',
    banco: ''
  });
  
  useEffect(() => {
    // Cargar datos al abrir el modal
    const loadData = async () => {
      const [eligibilityData, methodsData] = await Promise.all([
        fetch(`/api/withdrawals/eligibility/${username}`).then(r => r.json()),
        fetch(`/api/withdrawals/allowed-methods/${username}`).then(r => r.json())
      ]);
      
      setEligibility(eligibilityData);
      setAllowedMethods(methodsData.allowedMethods);
      
      // Preseleccionar el primer método permitido
      if (methodsData.allowedMethods.length > 0) {
        setFormData(prev => ({
          ...prev,
          payment_method: methodsData.allowedMethods[0]
        }));
      }
    };
    
    loadData();
  }, [username]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateWithdrawalForm(
      formData.monto,
      allowedMethods,
      formData.payment_method
    );
    
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }
    
    await submitWithdrawal({
      ...formData,
      username
    });
    
    onClose();
  };
  
  if (!eligibility?.eligible) {
    return (
      <div>
        <p>No puedes retirar en este momento</p>
        <p>Motivo: {eligibility?.reason}</p>
        <button onClick={onClose}>Cerrar</button>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <h2>Solicitar Retiro</h2>
      
      <p>Balance disponible: {eligibility.availableBalance} BS</p>
      
      {/* Método de pago */}
      <div>
        <label>Método de Pago:</label>
        {renderPaymentMethods(allowedMethods)}
      </div>
      
      {/* Monto */}
      <input
        type="number"
        value={formData.monto}
        onChange={e => setFormData({ ...formData, monto: parseFloat(e.target.value) })}
        min={150}
        placeholder="Monto mínimo: 150 BS"
      />
      
      {/* Otros campos... */}
      <button type="submit">Solicitar Retiro</button>
    </form>
  );
};
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
**Eventos de Ruleta:**
- `snapshot`: Estado inicial de la mesa
- `bet.placed`: Nueva apuesta realizada
- `mesa.spinning`: Inicio de giro
- `mesa.closed`: Mesa cerrada
- `mesa.advanced`: Mesa avanzada

**Eventos de Usuario:**
- `user.balance.updated`: Actualización de balance del usuario

**Eventos de Depósitos:**
- `deposit.created`: Nuevo depósito creado
- `deposit.status_changed`: Estado de depósito cambiado
- `deposit.approved`: Depósito aprobado
- `deposit.rejected`: Depósito rechazado

**Eventos de Retiros:**
- `withdrawal.created`: Nueva solicitud de retiro creada
- `withdrawal.status_changed`: Estado de retiro cambiado
- `withdrawal.approved`: Retiro aprobado
- `withdrawal.rejected`: Retiro rechazado

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

## 📝 **CAMBIOS RECIENTES**

### **2025-01-22 - Sistema de Eventos SSE para Retiros**
**Archivos creados:**
- `src/services/WithdrawalEvents.ts` - Nuevo sistema de eventos para retiros

**Archivos modificados:**
- `src/services/WithdrawalService.ts` - Emite eventos SSE al crear y actualizar retiros
- `src/routes/RouletteRoutes.ts` - Configurado listener de eventos de retiros en streams SSE
- `memoria-backend.md` - Actualizada documentación

**Eventos implementados:**
- `withdrawal.created` - Emitido cuando un usuario crea una solicitud de retiro
- `withdrawal.status_changed` - Emitido cuando cambia el estado de un retiro
- `withdrawal.approved` - Emitido cuando se aprueba un retiro
- `withdrawal.rejected` - Emitido cuando se rechaza un retiro

**Impacto:**
- ✅ Admin recibe notificaciones en tiempo real de nuevos retiros
- ✅ Admin recibe actualizaciones automáticas al cambiar estado de retiros
- ✅ Usuario recibe actualización de balance automática al aprobar/rechazar retiros
- ✅ Frontend puede actualizar la tabla sin recargar la página
- ✅ Mejora la experiencia de usuario

### **2025-01-22 - Sistema de Eventos SSE para Depósitos**
**Archivos creados:**
- `src/services/DepositEvents.ts` - Nuevo sistema de eventos para depósitos

**Archivos modificados:**
- `src/services/DepositService.ts` - Emite eventos SSE al crear y actualizar depósitos
- `src/routes/RouletteRoutes.ts` - Configurado listener de eventos de depósitos en streams SSE
- `memoria-backend.md` - Actualizada documentación

**Eventos implementados:**
- `deposit.created` - Emitido cuando un usuario crea un depósito
- `deposit.status_changed` - Emitido cuando cambia el estado de un depósito
- `deposit.approved` - Emitido cuando se aprueba un depósito
- `deposit.rejected` - Emitido cuando se rechaza un depósito

**Impacto:**
- ✅ Admin recibe notificaciones en tiempo real de nuevos depósitos
- ✅ Admin recibe actualizaciones automáticas al cambiar estado de depósitos
- ✅ Frontend puede actualizar la tabla sin recargar la página
- ✅ Mejora la experiencia de usuario

### **2025-01-22 - Notificación en Tiempo Real para Depósitos Aprobados**
**Archivos modificados:**
- `src/services/DepositService.ts` - Agregado evento `user.balance.updated` al aprobar depósito
- `memoria-backend.md` - Actualizada documentación

**Cambios implementados:**
- Cuando se aprueba un depósito (`PUT /api/deposits/:id/status` con `status: "approved"`), se emite evento en tiempo real
- Evento `user.balance.updated` se envía al frontend vía SSE con información del nuevo balance
- El frontend recibe actualización automática del balance del usuario sin necesidad de recargar

**Payload del evento:**
```json
{
  "username": "usuario123",
  "balance": "1500.00",
  "losses": 500,
  "wins": 1000,
  "reason": "deposit_approved",
  "depositId": 42,
  "depositAmount": 500.00
}
```

**Problema resuelto:**
- ❌ El balance se actualizaba en la BD pero el frontend no recibía notificación en tiempo real
- ✅ Ahora el frontend recibe actualización automática del balance al aprobar depósitos

**Impacto:**
- ✅ Usuarios ven actualización inmediata del balance
- ✅ Consistencia con el flujo de apuestas y premios
- ✅ Mejor experiencia de usuario

### **2025-01-22 - Sistema de Eliminación Lógica y Reactivación de Usuarios**
**Archivos modificados:**
- `src/services/AuthService.ts` - Agregado campo `isActive` en login y JWT, removida restricción de login por `isActive`
- `src/services/UserService.ts` - Implementada función unificada `_toggleActiveStatus` para activación/desactivación
- `src/routes/UserRoutes.ts` - Agregado endpoint `PUT /api/users/reactivate/:id`
- `src/routes/index.ts` - Registrada nueva ruta de reactivación
- `memoria-backend.md` - Actualizada documentación completa

**Nuevos endpoints implementados:**
- `PUT /api/users/reactivate/:id` - Reactivar usuario eliminado lógicamente
- `GET /api/users/test/:id` - Verificar existencia de usuario (testing)

**Cambios en endpoints existentes:**
- `POST /api/auth/login` - Ahora incluye campo `isActive` en respuesta
- `GET /api/users` - Ahora devuelve TODOS los usuarios (activos e inactivos)
- `DELETE /api/users/:id` - Confirmada eliminación lógica (no física)

**Problemas resueltos:**
- ✅ Eliminación lógica funcionando correctamente
- ✅ Campo `isActive` disponible en frontend para validaciones
- ✅ Admin puede ver usuarios activos e inactivos
- ✅ Sistema de reactivación implementado
- ✅ Reutilización de código para activación/desactivación

**Impacto:**
- ✅ Frontend puede manejar usuarios inactivos
- ✅ Admin puede gestionar usuarios eliminados
- ✅ Sistema de auditoría preservado
- ✅ Flexibilidad para reactivar cuentas

### **2025-01-20 - Corrección campo `role` en login**
**Archivos modificados:**
- `src/services/AuthService.ts` - Agregado campo `role` en respuesta de login
- `src/routes/AuthRoutes.ts` - Corregido JWT para usar role real del usuario
- `memoria-backend.md` - Actualizada documentación del endpoint login

**Problema resuelto:**
- El frontend recibía `role: undefined` en el login
- El backend no incluía el campo `role` en la respuesta
- Ahora el login devuelve correctamente el `role` del usuario

**Impacto:**
- ✅ Frontend puede distinguir entre usuarios `admin` y `user`
- ✅ Dashboard muestra "Dashboard Admin" para usuarios admin
- ✅ Sistema de roles funciona correctamente

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

## 🎯 **GUÍA PARA EL FRONTEND**

### **📋 Resumen de Endpoints para Gestión de Usuarios**

#### **1. Autenticación**
```javascript
// Login - incluye campo isActive
POST /api/auth/login
{
  "username": "gabriel",
  "password": "123456"
}
// Response incluye: { user: { ..., isActive: true } }

// Verificar autenticación
GET /api/auth/verify
// Headers: Cookie: authToken=...

// Logout
POST /api/auth/logout
```

#### **2. Gestión de Usuarios (Admin)**
```javascript
// Obtener TODOS los usuarios (activos e inactivos)
GET /api/users
// Headers: Cookie: authToken=... (admin)
// Response: { users: [{ ..., isActive: true/false }] }

// Eliminar usuario (eliminación lógica)
DELETE /api/users/:id
// Headers: Cookie: authToken=... (admin)
// Response: { message: "User deleted successfully" }

// Reactivar usuario
PUT /api/users/reactivate/:id
// Headers: Cookie: authToken=... (admin)
// Response: { message: "User reactivated successfully" }

// Verificar si usuario existe (testing)
GET /api/users/test/:id
// Headers: Cookie: authToken=... (admin)
// Response: { exists: true, user: { id, username, isActive } }
```

#### **3. Validaciones en Frontend**
```javascript
// Después del login, verificar isActive
if (user.isActive === false) {
  // Mostrar mensaje: "Usuario suspendido"
  // Redirigir a página de contacto
  // No permitir acceso al dashboard
}

// En lista de usuarios admin
users.forEach(user => {
  if (user.isActive === false) {
    // Mostrar badge "Inactivo"
    // Mostrar botón "Reactivar"
  } else {
    // Mostrar badge "Activo"
    // Mostrar botón "Eliminar"
  }
});
```

#### **4. Flujo de Eliminación/Reactivación**
```javascript
// Eliminar usuario
const deleteUser = async (userId) => {
  const response = await fetch(`/api/users/${userId}`, {
    method: 'DELETE',
    credentials: 'include' // Para enviar cookies
  });
  const result = await response.json();
  // Actualizar lista de usuarios
  // El usuario ahora aparece con isActive: false
};

// Reactivar usuario
const reactivateUser = async (userId) => {
  const response = await fetch(`/api/users/reactivate/${userId}`, {
    method: 'PUT',
    credentials: 'include' // Para enviar cookies
  });
  const result = await response.json();
  // Actualizar lista de usuarios
  // El usuario ahora aparece con isActive: true
};
```

#### **5. Headers Requeridos**
```javascript
// Para todos los endpoints que requieren autenticación
const headers = {
  'Content-Type': 'application/json',
  'Cookie': 'authToken=tu_token_jwt_aqui' // O usar credentials: 'include'
};

// Para requests con cookies automáticas
const requestOptions = {
  method: 'GET', // o POST, PUT, DELETE
  credentials: 'include', // Envía cookies automáticamente
  headers: {
    'Content-Type': 'application/json'
  }
};
```

#### **6. Estados de Usuario**
- **`isActive: true`** = Usuario activo, puede hacer login y usar la app
- **`isActive: false`** = Usuario eliminado lógicamente, no puede usar la app
- **Admin puede ver ambos estados** en la lista de usuarios
- **Frontend debe validar `isActive`** después del login

#### **7. Ejemplo de Implementación Completa**
```javascript
// Componente de gestión de usuarios
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  
  // Cargar usuarios
  useEffect(() => {
    fetch('/api/users', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setUsers(data.users));
  }, []);
  
  // Eliminar usuario
  const handleDelete = async (userId) => {
    await fetch(`/api/users/${userId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    // Recargar lista
    window.location.reload();
  };
  
  // Reactivar usuario
  const handleReactivate = async (userId) => {
    await fetch(`/api/users/reactivate/${userId}`, {
      method: 'PUT',
      credentials: 'include'
    });
    // Recargar lista
    window.location.reload();
  };
  
  return (
    <div>
      {users.map(user => (
        <div key={user.id}>
          <span>{user.username}</span>
          <span>{user.isActive ? 'Activo' : 'Inactivo'}</span>
          {user.isActive ? (
            <button onClick={() => handleDelete(user.id)}>
              Eliminar
            </button>
          ) : (
            <button onClick={() => handleReactivate(user.id)}>
              Reactivar
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
```

---

## 📚 Documentación Adicional

### **Sistema de Retiros - Administración**
Para información completa sobre gestión de retiros por parte del administrador, consultar:
- **Archivo:** `retiros.mdx` en la raíz del proyecto
- **Contenido:** Endpoints de admin, aprobación/rechazo de retiros, filtros, ejemplos de código

---

*Este documento se mantiene actualizado automáticamente con cada cambio en el backend.*
