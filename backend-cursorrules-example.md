# Reglas de Código para Backend (Node.js + Express + TypeScript + Sequelize)

## TypeScript
- NUNCA uses 'any' - siempre usa tipos específicos
- Usa interfaces en lugar de tipos cuando sea posible
- Siempre define tipos de retorno explícitos
- Prefiere 'unknown' sobre 'any'
- Usa type guards en lugar de casting
- Define interfaces para modelos de Sequelize
- Tipa explícitamente los parámetros de Express (req, res, next)

## Node.js - Buenas Prácticas
- Usa async/await en lugar de callbacks
- Implementa manejo de errores consistente con try/catch
- Usa process.env para variables de entorno
- Implementa logging estructurado (winston, pino)
- Maneja señales de proceso (SIGTERM, SIGINT)
- Usa cluster para aprovechar múltiples CPUs
- Implementa graceful shutdown

## Express.js - Buenas Prácticas
- Usa middleware para validación y autenticación
- Implementa rate limiting (express-rate-limit)
- Usa helmet para headers de seguridad
- Implementa CORS apropiadamente
- Usa compression para respuestas
- Valida datos de entrada con express-validator
- Estructura rutas con Router()
- Usa next() para pasar errores al middleware de error
- Implementa middleware de error global

## Sequelize - Buenas Prácticas
- Define modelos con tipos TypeScript explícitos
- Usa migraciones para cambios de esquema
- Implementa transacciones para operaciones múltiples
- Usa índices apropiados para performance
- Implementa soft deletes cuando sea apropiado
- Usa paginación para consultas grandes
- Valida datos antes de guardar
- Usa hooks para lógica de negocio
- Implementa relaciones apropiadas (hasOne, hasMany, belongsTo)

## Seguridad
- NUNCA uses librerías deprecadas o obsoletas
- Implementa autenticación JWT o session-based
- Valida y sanitiza todas las entradas
- Usa HTTPS en producción
- Implementa rate limiting
- Usa helmet para headers de seguridad
- Valida archivos subidos
- Implementa CORS apropiadamente
- Usa variables de entorno para secretos

## Estructura de Proyecto
- Organiza código en capas (controllers, services, models, routes)
- Separa lógica de negocio de lógica de presentación
- Usa inyección de dependencias cuando sea apropiado
- Implementa patrón Repository para acceso a datos
- Crea middlewares reutilizables
- Organiza rutas por funcionalidad

## Manejo de Errores
- Implementa middleware de error global
- Usa códigos de estado HTTP apropiados
- Logea errores con contexto suficiente
- No expongas detalles internos en producción
- Implementa retry logic para operaciones críticas
- Valida datos de entrada antes de procesar

## Performance
- Usa índices de base de datos apropiados
- Implementa caching cuando sea necesario
- Usa paginación para listas grandes
- Optimiza consultas de Sequelize
- Implementa compression
- Usa connection pooling para base de datos

## Librerías y Dependencias
- NUNCA uses librerías deprecadas o obsoletas
- Siempre verifica la compatibilidad con Node.js LTS
- Prefiere librerías mantenidas activamente
- Usa alternativas modernas para librerías antiguas
- Verifica las fechas de última actualización en npm
- Evita librerías con vulnerabilidades de seguridad conocidas
- Prefiere librerías con tipos TypeScript incluidos

## Testing
- Escribe tests unitarios para lógica de negocio
- Implementa tests de integración para APIs
- Usa mocks para dependencias externas
- Testea casos de error y edge cases
- Mantén cobertura de código alta
- Usa herramientas como Jest o Mocha

## Logging y Monitoreo
- Implementa logging estructurado
- Usa diferentes niveles de log (error, warn, info, debug)
- Incluye contexto relevante en los logs
- Implementa métricas de performance
- Usa herramientas de monitoreo (PM2, New Relic, etc.)
- Logea requests y responses cuando sea necesario
