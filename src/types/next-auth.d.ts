import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      universityId: string;
      universityName: string;
      channelId: string | null;
      channelName: string | null;
      year: number;
      isRepresentative: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    universityId: string;
    universityName: string;
    channelId: string | null;
    channelName: string | null;
    year: number;
    isRepresentative: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    universityId: string;
    universityName: string;
    channelId: string | null;
    channelName: string | null;
    year: number;
    isRepresentative: boolean;
  }
}
