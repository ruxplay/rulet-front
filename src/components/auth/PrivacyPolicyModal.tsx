'use client';

import { useCallback } from 'react';
import '@/styles/components/privacy-policy-modal.css';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal = ({ isOpen, onClose }: PrivacyPolicyModalProps): React.ReactElement | null => {
  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="privacy-policy-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacyPolicyTitle"
      onClick={handleBackdropClick}
    >
      <div className="privacy-policy-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="privacy-policy-modal-header">
          <h2 id="privacyPolicyTitle" className="privacy-policy-modal-title">
            🔒 Política de Privacidad de RubPlay
          </h2>
          <button
            className="privacy-policy-modal-close"
            aria-label="Cerrar"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        <div className="privacy-policy-modal-content">
          <p><strong>Última actualización:</strong> Fecha</p>
          
          <h3>1. Introducción</h3>
          <p>
            Bienvenido a RubPlay nosotros nos comprometemos a proteger tu privacidad y tus datos personales. 
            Esta política explica cómo recopilamos, usamos, almacenamos y protegemos tu información cuando 
            utilizas nuestros servicios, juegos y funciones online.
          </p>

          <h3>2. Información que Recopilamos</h3>
          <p>
            <strong>Información personal:</strong> Como nombre, correo electrónico, fecha de nacimiento 
            (para verificar la mayoría de edad), y datos de pago si realizas transacciones.
          </p>
          <p>
            <strong>Datos técnicos:</strong> Dirección IP, tipo de dispositivo, sistema operativo, 
            navegador, y cookies.
          </p>
          <p>
            <strong>Uso de la plataforma:</strong> Historial de juegos, preferencias, interacciones 
            sociales (como chats o amigos agregados), y progreso en los juegos.
          </p>
          <p>
            <strong>Información de terceros:</strong> Si accedes mediante redes sociales (ej. Facebook, 
            Google), recibimos datos de perfil públicos.
          </p>

          <h3>3. Uso de la Información</h3>
          <p>Utilizamos tu información para:</p>
          <ul>
            <li>Proporcionar y personalizar los juegos y servicios.</li>
            <li>Gestionar tu cuenta y verificar tu identidad.</li>
            <li>Procesar pagos y prevenir fraudes.</li>
            <li>Enviar comunicaciones (ofertas, actualizaciones) si das tu consentimiento.</li>
            <li>Cumplir con obligaciones legales y mejorar la seguridad.</li>
          </ul>

          <h3>4. Cookies y Tecnologías Similares</h3>
          <p>Usamos cookies para:</p>
          <ul>
            <li>Recordar tus preferencias y sesiones.</li>
            <li>Analizar el tráfico y mejorar la experiencia.</li>
            <li>Mostrar publicidad personalizada.</li>
          </ul>
          <p>
            Puedes desactivarlas desde la configuración de tu navegador, aunque esto podría afectar 
            al funcionamiento de la plataforma.
          </p>

          <h3>5. Compartición de Datos</h3>
          <p>No vendemos tu información personal, pero podremos compartirla con:</p>
          <ul>
            <li>
              <strong>Proveedores de servicios:</strong> Como empresas de pago, alojamiento web, 
              o soporte técnico.
            </li>
            <li>
              <strong>Autoridades legales:</strong> Si es requerido por ley o para proteger nuestros derechos.
            </li>
            <li>
              <strong>Socios comerciales:</strong> Solo de forma agregada y anónima para análisis.
            </li>
          </ul>

          <h3>6. Seguridad de los Datos</h3>
          <p>
            Implementamos medidas técnicas y organizativas (como cifrado y firewalls) para proteger 
            tus datos. Sin embargo, ninguna transmisión online es 100% segura.
          </p>

          <h3>7. Derechos del Usuario</h3>
          <p>Dependiendo de tu jurisdicción, puedes:</p>
          <ul>
            <li>Acceder, rectificar o eliminar tus datos.</li>
            <li>Revocar consentimientos para marketing.</li>
            <li>Solicitar la portabilidad de tus datos.</li>
            <li>Oponerte al procesamiento en ciertos casos.</li>
          </ul>
          <p>Contacto para privacidad: ruxplayoficial@gmail.com</p>

          <h3>8. Retención de Datos</h3>
          <p>
            Conservamos tu información mientras tu cuenta esté activa o según lo necesario para cumplir 
            con fines legales. Los datos de pago se almacenan según las leyes financieras aplicables.
          </p>

          <h3>9. Menores de Edad</h3>
          <p>
            Nuestros servicios no están dirigidos a menores de 18 años (o la edad legal en tu país). 
            Si descubrimos que recopilamos datos de un menor sin consentimiento parental, tomaremos 
            medidas para eliminarlos.
          </p>

          <h3>10. Enlaces a Terceros</h3>
          <p>
            No nos hacemos responsables de las prácticas de privacidad de sitios externos enlazados 
            desde nuestra plataforma. Te recomendamos leer sus políticas.
          </p>

          <h3>11. Cambios en esta Política</h3>
          <p>
            Notificaremos cambios importantes mediante un aviso en la plataforma o por correo. 
            El uso continuado implica la aceptación de los nuevos términos.
          </p>

          <h3>12. Contacto</h3>
          <p>
            Para preguntas sobre esta política o ejercer tus derechos, escríbenos a: 
            ruxplayoficial@gmail.com
          </p>
        </div>
        <div className="privacy-policy-modal-footer">
          <button 
            className="privacy-policy-modal-close-btn" 
            type="button" 
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

