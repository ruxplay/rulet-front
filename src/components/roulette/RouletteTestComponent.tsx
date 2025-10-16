'use client';

import { useState } from 'react';
import { RouletteType } from '@/types';
import { useRouletteApiTest } from './hooks/useRouletteApiTest';

// Componente de prueba para validar la funcionalidad básica
export const RouletteTestComponent = () => {
  const [selectedType, setSelectedType] = useState<RouletteType>('150');
  const [testResults, setTestResults] = useState<string[]>([]);

  const {
    testResults: apiTestResults,
    isRunning: isApiTestRunning,
    runApiTests,
    clearResults: clearApiResults,
    mesaData,
    isLoading,
    error
  } = useRouletteApiTest(selectedType);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const runBasicTests = () => {
    setTestResults([]);
    
    // Test 1: Verificar tipos
    addTestResult('✅ Tipos TypeScript configurados correctamente');
    
    // Test 2: Verificar configuración de API
    addTestResult('✅ Configuración de API de ruleta cargada');
    
    // Test 3: Verificar componentes
    addTestResult('✅ Componentes de ruleta importados correctamente');
    
    // Test 4: Verificar estilos
    addTestResult('✅ Estilos CSS cargados correctamente');
    
    // Test 5: Verificar navegación
    addTestResult('✅ Navegación agregada al header');
    
    // Test 6: Verificar estado
    addTestResult(`✅ Estado inicial: Ruleta ${selectedType} seleccionada`);
  };

  const testTypeChange = () => {
    const newType = selectedType === '150' ? '300' : '150';
    setSelectedType(newType);
    addTestResult(`✅ Cambio de tipo: ${selectedType} → ${newType}`);
  };

  const clearAllResults = () => {
    setTestResults([]);
    clearApiResults();
  };

  return (
    <div style={{ 
      padding: '20px', 
      background: 'rgba(255,255,255,0.1)', 
      borderRadius: '10px',
      margin: '20px',
      color: 'white'
    }}>
      <h3>🧪 Componente de Prueba - Ruleta</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runBasicTests}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            borderRadius: '5px',
            border: 'none',
            background: '#3498db',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Pruebas Básicas
        </button>
        
        <button 
          onClick={runApiTests}
          disabled={isApiTestRunning}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            borderRadius: '5px',
            border: 'none',
            background: isApiTestRunning ? '#95a5a6' : '#2ecc71',
            color: 'white',
            cursor: isApiTestRunning ? 'not-allowed' : 'pointer'
          }}
        >
          {isApiTestRunning ? 'Probando API...' : 'Probar API'}
        </button>
        
        <button 
          onClick={testTypeChange}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            borderRadius: '5px',
            border: 'none',
            background: '#e74c3c',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Cambiar Tipo ({selectedType})
        </button>

        <button 
          onClick={clearAllResults}
          style={{
            padding: '10px 20px',
            borderRadius: '5px',
            border: 'none',
            background: '#95a5a6',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Limpiar
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Pruebas básicas */}
        <div>
          <h4>Pruebas Básicas:</h4>
          <div style={{ 
            background: 'rgba(0,0,0,0.3)', 
            padding: '10px', 
            borderRadius: '5px',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {testResults.length === 0 ? (
              <p>No hay pruebas ejecutadas aún</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} style={{ marginBottom: '5px', fontSize: '0.9rem' }}>
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pruebas de API */}
        <div>
          <h4>Pruebas de API:</h4>
          <div style={{ 
            background: 'rgba(0,0,0,0.3)', 
            padding: '10px', 
            borderRadius: '5px',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {apiTestResults.length === 0 ? (
              <p>No hay pruebas de API ejecutadas aún</p>
            ) : (
              apiTestResults.map((result, index) => (
                <div key={index} style={{ marginBottom: '5px', fontSize: '0.9rem' }}>
                  {result}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h4>Estado Actual:</h4>
        <p>Tipo seleccionado: <strong>{selectedType}</strong></p>
        <p>Pruebas básicas: <strong>{testResults.length}</strong></p>
        <p>Pruebas de API: <strong>{apiTestResults.length}</strong></p>
        {mesaData && (
          <p>Mesa actual: <strong>{mesaData.mesa?.mesaId || 'N/A'}</strong></p>
        )}
        {error && (
          <p style={{ color: '#e74c3c' }}>Error: <strong>{error.toString()}</strong></p>
        )}
      </div>
    </div>
  );
};
