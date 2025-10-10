// Ejemplo de cómo usar la autenticación con cookies HTTP-Only desde el frontend

// 1. LOGIN - El usuario hace login
async function login(username, password) {
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // IMPORTANTE: Para enviar cookies
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Login exitoso:', data.user);
      // La cookie se guarda automáticamente
      return data.user;
    } else {
      console.error('❌ Error de login:', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error de red:', error);
    return null;
  }
}

// 2. VERIFICAR AUTENTICACIÓN - Al recargar la página
async function checkAuth() {
  try {
    const response = await fetch('http://localhost:3000/api/auth/verify', {
      credentials: 'include' // IMPORTANTE: Para enviar cookies
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Usuario autenticado:', data.user);
      return data.user;
    } else {
      console.log('❌ Usuario no autenticado');
      return null;
    }
  } catch (error) {
    console.error('❌ Error verificando auth:', error);
    return null;
  }
}

// 3. LOGOUT - Cerrar sesión
async function logout() {
  try {
    const response = await fetch('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      credentials: 'include' // IMPORTANTE: Para enviar cookies
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Logout exitoso');
      // La cookie se elimina automáticamente
    } else {
      console.error('❌ Error de logout:', data.error);
    }
  } catch (error) {
    console.error('❌ Error de red:', error);
  }
}

// 4. HACER REQUEST AUTENTICADO - Para APIs protegidas
async function makeAuthenticatedRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include' // IMPORTANTE: Para enviar cookies
    });
    
    if (response.status === 401) {
      console.log('❌ No autenticado, redirigir a login');
      // Redirigir a login
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ Error en request:', error);
    return null;
  }
}

// 5. EJEMPLO DE USO COMPLETO
async function ejemploCompleto() {
  // Al cargar la página, verificar si está autenticado
  const user = await checkAuth();
  
  if (user) {
    console.log('Usuario ya está logueado:', user);
    // Mostrar dashboard
  } else {
    console.log('Usuario no está logueado');
    // Mostrar formulario de login
  }
  
  // Ejemplo de login
  const loginResult = await login('usuario123', 'password123');
  
  if (loginResult) {
    // Hacer request autenticado
    const deposits = await makeAuthenticatedRequest('http://localhost:3000/api/deposits/user/usuario123');
    console.log('Depósitos del usuario:', deposits);
  }
  
  // Ejemplo de logout
  await logout();
}

// Ejecutar ejemplo
ejemploCompleto();
