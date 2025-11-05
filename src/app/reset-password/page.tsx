import { Suspense } from 'react';
import { ResetPasswordContent } from './ResetPasswordContent';

function ResetPasswordLoading(): React.ReactElement {
  return (
    <div className="auth-page-container">
      <h1 className="auth-page-title">Restablecer contraseña</h1>
      <p className="auth-info">Cargando...</p>
    </div>
  );
}

export default function ResetPasswordPage(): React.ReactElement {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
