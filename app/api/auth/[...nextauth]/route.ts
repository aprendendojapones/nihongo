import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { supabase } from "@/lib/supabase";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (!user.email) return false;

            // Check if user exists in Supabase profiles
            const { data, error } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', user.email)
                .single();

            if (error && error.code === 'PGRST116') {
                // User doesn't exist, create profile
                const { error: insertError } = await supabase
                    .from('profiles')
                    .insert({
                        email: user.email,
                        full_name: user.name,
                        avatar_url: user.image,
                        xp: 0,
                        streak: 0,
                        level: 'N5'
                    });
                if (insertError) console.error('Error creating profile:', insertError);
            }

            return true;
        },
        async session({ session, token }) {
            if (session.user?.email) {
                // Fetch extra data from Supabase
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('email', session.user.email)
                    .single();

                if (data) {
                    session.user = {
                        ...session.user,
                        ...data
                    };
                }
            }
            return session;
        },
    },
});

export { handler as GET, handler as POST };
