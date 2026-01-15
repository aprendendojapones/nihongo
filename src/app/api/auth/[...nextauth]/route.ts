import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "@/lib/config";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.sub;
            }
            return session;
        },
    },
});

export { handler as GET, handler as POST };
