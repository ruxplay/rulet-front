// src/services/AuthService.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import SqlUser from '@src/models/SqlUser';
import { LoginInput, RegisterInput, PasswordResetInput } from '@src/validators/AuthValidator';

const ROUNDS = Number(process.env.BCRYPT_ROUNDS || 10);
const JWT_SECRET = process.env.JWT_SECRET || 'CHANGEME_SECRET';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '24h';

export async function register(input: RegisterInput) {
  const { username, email, password, fullName, phone } = input;
  const existsUser = await SqlUser.findOne({ where: { username } });
  if (existsUser) throw new Error('El usuario ya existe');
  const existsEmail = await SqlUser.findOne({ where: { email } });
  if (existsEmail) throw new Error('El correo ya está registrado');

  const passwordHash = await bcrypt.hash(password, ROUNDS);
  const user = await SqlUser.create({ username, email, passwordHash, fullName, phone: phone || null });
  return { id: user.id, username: user.username, email: user.email, fullName: user.fullName };
}

export async function login(input: LoginInput) {
  const { username, email, password } = input;
  const where = username ? { username } : { email };
  const user = await SqlUser.findOne({ where: where as any });
  if (!user) throw new Error('Credenciales inválidas');

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error('Credenciales inválidas');

  user.lastLogin = new Date();
  await user.save();

  const token = jwt.sign({ sub: user.id, username: user.username, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  return { token, user: { id: user.id, username: user.username, email: user.email, fullName: user.fullName } };
}

export async function usernamesByEmail(email: string) {
  const rows = await SqlUser.findAll({ where: { email }, attributes: ['username'] });
  return rows.map(r => r.username);
}

export async function requestPasswordReset(input: PasswordResetInput) {
  // Placeholder (en producción: generar token y enviar email).
  return { ok: true };
}

// JWT utility functions for cookie authentication
export const generateJWT = (user: any): string => {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      email: user.email,
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
};

export const verifyJWT = (token: string): any => {
  return jwt.verify(token, JWT_SECRET);
};

export const decodeJWT = (token: string): any => {
  return jwt.decode(token);
};