import NextAuth from 'next-auth';
import { getServerSession, type NextAuthOptions } from 'next-auth';
import { authOptions } from './config';

export const auth = (req: any, res: any) => getServerSession(req, res, authOptions);
export const handlers = NextAuth(authOptions);
export const signIn = undefined as unknown as never;
export const signOut = undefined as unknown as never;
