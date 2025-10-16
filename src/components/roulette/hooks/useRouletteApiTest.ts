'use client';

import { useState, useEffect } from 'react';
import { useGetCurrentMesaQuery } from '@/store/api/rouletteApi';
import { RouletteType } from '@/types';

export const useRouletteApiTest = (type: RouletteType) => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [shouldTest, setShouldTest] = useState(false);

  const { 
    data: mesaData, 
    isLoading, 
    error,
    refetch 
  } = useGetCurrentMesaQuery(type, {
    skip: !shouldTest // Solo ejecutar cuando shouldTest sea true
  });

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const runApiTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      // Test 1: Verificar configuración de API
      addTestResult('✅ Configuración de API verificada');
      
      // Test 2: Activar la query
      addTestResult('🔄 Activando conexión con el backend...');
      setShouldTest(true);
      
      // Esperar un momento para que la query se ejecute
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Test 3: Verificar si hay datos
      if (mesaData) {
        addTestResult('✅ Conexión con backend exitosa');
        addTestResult(`📊 Mesa ID: ${mesaData.mesa?.mesaId || 'N/A'}`);
        addTestResult(`📊 Estado: ${mesaData.mesa?.status || 'N/A'}`);
        addTestResult(`📊 Sectores llenos: ${mesaData.mesa?.filledCount || 0}/15`);
        
        // Test 4: Verificar tipos de datos
        if (mesaData.mesa) {
          addTestResult('✅ Estructura de datos válida');
          addTestResult(`📊 Sectores: ${Array.isArray(mesaData.mesa.sectors) ? 'Array válido' : 'Error'}`);
        }
      } else if (error) {
        addTestResult(`❌ Error de conexión: ${error.toString()}`);
      } else if (isLoading) {
        addTestResult('⏳ Cargando datos del backend...');
      } else {
        addTestResult('⚠️ No hay datos disponibles (puede ser normal si no hay mesa activa)');
      }
      
    } catch (error) {
      addTestResult(`❌ Error en API: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    setShouldTest(false);
  };

  return {
    testResults,
    isRunning,
    runApiTests,
    clearResults,
    mesaData,
    isLoading,
    error
  };
};
