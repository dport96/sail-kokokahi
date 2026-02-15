/* eslint-disable arrow-body-style */
import { compare } from 'bcrypt';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';

const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Email and Password',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'john@foo.com',
        },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        // Normalize and perform a case-insensitive lookup so sign-in is not affected by email casing.
        const lookupEmail = credentials.email.trim().toLowerCase();

        const user = await prisma.user.findFirst({
          where: {
            email: {
              equals: lookupEmail,
              mode: 'insensitive',
            },
          },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await compare(credentials.password, user.password);
        if (!isPasswordValid) {
          return null;
        }

        return {
          id: `${user.id}`,
          email: user.email,
          randomKey: user.role,
          mustChangePassword: user.mustChangePassword,
        };
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          randomKey: token.randomKey,
          mustChangePassword: token.mustChangePassword,
        },
      };
    },
    jwt: ({ token, user }) => {
      if (user) {
        const u = user as unknown as any;
        return {
          ...token,
          id: u.id,
          randomKey: u.randomKey,
          mustChangePassword: u.mustChangePassword,
        };
      }
      return token;
    },
    redirect: async ({ url, baseUrl }) => {
      // Use NEXTAUTH_URL if set, otherwise fall back to baseUrl
      const redirectBase = process.env.NEXTAUTH_URL || baseUrl;
      
      // If signing out, redirect to the base URL (original domain)
      if (url.includes('/auth/signout')) {
        return redirectBase;
      }
      // Default behavior for other redirects
      if (url.startsWith('/')) return `${redirectBase}${url}`;
      if (new URL(url).origin === redirectBase) return url;
      return redirectBase;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;
