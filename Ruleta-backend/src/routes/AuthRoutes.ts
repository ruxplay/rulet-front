// src/routes/AuthRoutes.ts
import { Router, Request, Response } from 'express';
import { register, login, usernamesByEmail, requestPasswordReset, generateJWT } from '@src/services/AuthService';
import { 
  LoginSchema, 
  RegisterSchema, 
  UsernamesQuerySchema, 
  PasswordResetSchema 
} from '@src/validators/AuthValidator';
import { authenticateToken } from '@src/middleware/auth';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const registerData = RegisterSchema.parse(req.body);
    const user = await register(registerData);
    return res.status(201).json({ user });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const loginData = LoginSchema.parse(req.body);
    const result = await login(loginData);
    
    // Generate JWT for cookie
    const token = generateJWT(result.user);
    
    // Set HTTP-Only cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    return res.status(200).json({ 
      success: true, 
      user: result.user,
      message: 'Login successful'
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

router.get('/usernames', async (req: Request, res: Response) => {
  try {
    const { email } = UsernamesQuerySchema.parse(req.query);
    const list = await usernamesByEmail(email);
    return res.status(200).json({ usernames: list });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

router.post('/password/reset', async (req: Request, res: Response) => {
  try {
    const resetData = PasswordResetSchema.parse(req.body);
    await requestPasswordReset(resetData);
    return res.status(200).json({ ok: true });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

// Verify authentication endpoint
router.get('/verify', authenticateToken, (req: Request, res: Response) => {
  return res.status(200).json({ 
    success: true, 
    user: req.user,
    message: 'User authenticated'
  });
});

// Logout endpoint
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('authToken');
  return res.status(200).json({ 
    success: true, 
    message: 'Logout successful' 
  });
});

export default router;