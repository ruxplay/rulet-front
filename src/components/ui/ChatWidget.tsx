'use client';

import React, { useEffect } from 'react';

interface ChatWidgetProps {
  propertyId?: string;
  widgetId?: string;
}

/**
 * Componente para integrar Tawk.to chat widget
 * 
 * @param propertyId - ID de la propiedad de Tawk.to (opcional, puede venir de env)
 * @param widgetId - ID del widget de Tawk.to (opcional, puede venir de env)
 * 
 * Uso:
 * 1. Crear cuenta en https://www.tawk.to
 * 2. Obtener Property ID y Widget ID del dashboard
 * 3. Agregar a .env.local:
 *    NEXT_PUBLIC_TAWK_PROPERTY_ID=tu_property_id
 *    NEXT_PUBLIC_TAWK_WIDGET_ID=tu_widget_id
 * 4. Agregar <ChatWidget /> en layout.tsx
 */
export const ChatWidget: React.FC<ChatWidgetProps> = ({ 
  propertyId, 
  widgetId 
}) => {
  useEffect(() => {
    // Obtener IDs de props o variables de entorno
    const tawkPropertyId = propertyId || process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
    const tawkWidgetId = widgetId || process.env.NEXT_PUBLIC_TAWK_WIDGET_ID;

    // Si no hay IDs configurados, no cargar el widget
    if (!tawkPropertyId || !tawkWidgetId) {
      console.warn('Tawk.to: Property ID o Widget ID no configurados');
      return;
    }

    // Verificar si el script ya existe para evitar duplicados
    if (document.getElementById('tawk-script')) {
      return;
    }

    // Crear y configurar el script de Tawk.to
    const script = document.createElement('script');
    script.id = 'tawk-script';
    script.async = true;
    script.src = `https://embed.tawk.to/${tawkPropertyId}/${tawkWidgetId}`;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    
    // Agregar el script al head
    document.head.appendChild(script);

    // Cleanup: remover el script al desmontar el componente
    return () => {
      const tawkScript = document.getElementById('tawk-script');
      if (tawkScript) {
        tawkScript.remove();
      }
      
      // Ocultar el widget si está visible
      const tawkApi = (window as { Tawk_API?: { hideWidget: () => void } }).Tawk_API;
      if (tawkApi) {
        tawkApi.hideWidget();
      }
    };
  }, [propertyId, widgetId]);

  // Este componente no renderiza nada visible
  return null;
};

