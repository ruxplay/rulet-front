// Auth Components
export { default as ProtectedPage } from './ProtectedPage';
export { default as AuthPersistence } from './AuthPersistence';

// Re-export existing auth hook for convenience
export { useAuth } from '../layout/hooks/useAuth';
