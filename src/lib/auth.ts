import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            university: true,
            course: true,
          },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
          universityId: user.universityId,
          universityName: user.university.name,
          courseId: user.courseId,
          courseName: user.course?.name || null,
          year: user.year,
          isRepresentative: user.isRepresentative,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.universityId = user.universityId;
        token.universityName = user.universityName;
        token.courseId = user.courseId;
        token.courseName = user.courseName;
        token.year = user.year;
        token.isRepresentative = user.isRepresentative;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.universityId = token.universityId as string;
        session.user.universityName = token.universityName as string;
        session.user.courseId = token.courseId as string | null;
        session.user.courseName = token.courseName as string | null;
        session.user.year = token.year as number;
        session.user.isRepresentative = token.isRepresentative as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
