# 🎨 Paleta de Colores - RuxPlay

Paleta completa de los 15 colores principales utilizados en la aplicación.

---

## 📋 Colores Principales

### 1. **Azul Petróleo Oscuro (Primary)**
- **Hex**: `#0A192F`
- **RGB**: `rgb(10, 25, 47)`
- **Uso**: Color principal de la marca, fondos principales, headers
- **Ubicación**: `--primary` en `colors.css`

### 2. **Verde Neón (Secondary)**
- **Hex**: `#00FF9C`
- **RGB**: `rgb(0, 255, 156)`
- **Uso**: Color secundario, botones principales, acentos, elementos destacados
- **Ubicación**: `--secondary` en `colors.css`

### 3. **Verde Neón (Secondary Dark)**
- **Hex**: `#00FF9C`
- **RGB**: `rgb(0, 255, 156)`
- **Uso**: Verde neón (unificado con el color principal)
- **Ubicación**: `--secondary-dark` en `colors.css`

### 4. **Dorado (Accent)**
- **Hex**: `#C7A008`
- **RGB**: `rgb(199, 160, 8)`
- **Uso**: Acentos de lujo, detalles premium, elementos destacados
- **Ubicación**: `--accent` en `colors.css`

### 5. **Gris Antracita (Background)**
- **Hex**: `#1E1E1E`
- **RGB**: `rgb(30, 30, 30)`
- **Uso**: Fondo principal de la aplicación
- **Ubicación**: `--background` en `colors.css`

---

## 🎯 Colores de Estado

### 6. **Verde Neón (Success)**
- **Hex**: `#00FF9C`
- **RGB**: `rgb(0, 255, 156)`
- **Uso**: Indicadores de éxito, confirmaciones, estados positivos (unificado con verde neón)
- **Ubicación**: `--roulette-success-color`, usado en botones y mensajes

### 7. **Azul Información (Info)**
- **Hex**: `#3498db`
- **RGB**: `rgb(52, 152, 219)`
- **Uso**: Información, enlaces, elementos informativos
- **Ubicación**: `--roulette-secondary-color`, usado en botones y enlaces

### 8. **Rojo Peligro (Danger)**
- **Hex**: `#e74c3c`
- **RGB**: `rgb(231, 76, 60)`
- **Uso**: Errores, advertencias, acciones destructivas
- **Ubicación**: `--roulette-danger-color`, `--danger` en `colors.css`

---

## 🎲 Colores de la Ruleta

### 9. **Rojo Intenso (Ganador Secundario)**
- **Hex**: `#dc2626`
- **RGB**: `rgb(220, 38, 38)`
- **Uso**: Flecha ganador secundario derecho en la ruleta
- **Ubicación**: `border-top-color` en `.roulette-right-pointer`

### 10. **Amarillo Intenso (Ganador Terciario)**
- **Hex**: `#dcf30a`
- **RGB**: `rgb(220, 243, 10)`
- **Uso**: Flecha ganador terciario izquierdo en la ruleta
- **Ubicación**: `border-top-color` en `.roulette-left-pointer`

---

## 🌑 Colores de Fondo y Texto

### 11. **Azul Petróleo Claro (Primary Light)**
- **Hex**: `#2c3e50`
- **RGB**: `rgb(44, 62, 80)`
- **Uso**: Fondos secundarios, tarjetas, contenedores
- **Ubicación**: `--bg-primary`, `--roulette-primary-color`

### 12. **Azul Petróleo Variante 1**
- **Hex**: `#151A23`
- **RGB**: `rgb(21, 26, 35)`
- **Uso**: Gradientes de fondo, variaciones de primary
- **Ubicación**: Usado en gradientes de `roulette.css`

### 13. **Azul Petróleo Variante 2**
- **Hex**: `#1F2530`
- **RGB**: `rgb(31, 37, 48)`
- **Uso**: Gradientes de fondo, variaciones de primary
- **Ubicación**: Usado en gradientes de `roulette.css`

### 14. **Gris Claro (Text Secondary)**
- **Hex**: `#E5E5E5`
- **RGB**: `rgb(229, 229, 229)`
- **Uso**: Texto secundario, descripciones
- **Ubicación**: `--text-secondary` en `colors.css`

### 15. **Blanco (White)**
- **Hex**: `#FFFFFF`
- **RGB**: `rgb(255, 255, 255)`
- **Uso**: Texto principal, fondos de contraste, elementos destacados
- **Ubicación**: `--white`, `--text-primary` en `colors.css`

---

## 📊 Resumen Visual

```
┌─────────────────────────────────────────────────────────────┐
│  COLORES PRINCIPALES                                         │
├─────────────────────────────────────────────────────────────┤
│  #0A192F  #00FF9C  #00FF9C  #C7A008  #1E1E1E                │
│  Azul     Verde    Verde    Dorado   Gris                   │
│  Petróleo Neón    Neón     Accent   Antracita              │
├─────────────────────────────────────────────────────────────┤
│  COLORES DE ESTADO                                           │
├─────────────────────────────────────────────────────────────┤
│  #00FF9C  #3498db  #e74c3c                                 │
│  Verde    Azul     Rojo                                     │
│  Neón     Info     Peligro                                  │
├─────────────────────────────────────────────────────────────┤
│  COLORES DE LA RULETA                                        │
├─────────────────────────────────────────────────────────────┤
│  #dc2626  #dcf30a                                           │
│  Rojo     Amarillo                                          │
│  Intenso  Intenso                                            │
├─────────────────────────────────────────────────────────────┤
│  COLORES DE FONDO Y TEXTO                                   │
├─────────────────────────────────────────────────────────────┤
│  #2c3e50  #151A23  #1F2530  #E5E5E5  #FFFFFF               │
│  Azul     Azul     Azul     Gris     Blanco                │
│  Claro    Var.1    Var.2    Claro                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Notas de Uso

- **Colores Primarios** (#0A192F, #00FF9C, #00CC7A, #C7A008): Usar para elementos principales de la marca
- **Colores de Estado**: Usar para feedback visual (éxito, error, información)
- **Colores de la Ruleta**: Específicos para indicadores de ganadores
- **Colores de Fondo**: Usar para crear profundidad y jerarquía visual
- **Blanco y Gris**: Para texto y contraste

---

**Última actualización**: Diciembre 2024
**Archivo**: `PALETA_COLORES.md`

