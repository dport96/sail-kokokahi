import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      role: 'USER' | 'ADMIN';
      randomKey: 'USER' | 'ADMIN';
      mustChangePassword?: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    email: string;
    role: 'USER' | 'ADMIN';
    randomKey?: 'USER' | 'ADMIN';
    mustChangePassword?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    role: 'USER' | 'ADMIN';
    randomKey?: 'USER' | 'ADMIN';
    mustChangePassword?: boolean;
  }
}