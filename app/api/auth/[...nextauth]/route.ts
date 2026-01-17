import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createClient } from '@supabase/supabase-js';
import { supabase } from "@/lib/supabase";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async signIn({ user, account, profile }) {
            try {
                if (!user.email) return false;

                // Use service role key if available for admin operations, otherwise anon key
                const supabaseAdmin = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                );

                // Check if user exists in Supabase profiles
                const { data, error } = await supabaseAdmin
                    .from('profiles')
                    .select('id')
                    .eq('email', user.email)
                    .single();

                if (error && error.code === 'PGRST116') {
                    // User doesn't exist, create profile
                    const isSuperAdmin = user.email === 'maicontsuda@gmail.com';
                    const { error: insertError } = await supabaseAdmin
                        .from('profiles')
                        .insert({
                            email: user.email,
                            full_name: user.name,
                            avatar_url: user.image,
                            role: isSuperAdmin ? 'admin' : 'student',
                            xp: 0,
                            streak: 0,
                            level: 'N5',
                            language_pref: 'pt'
                        });
                    if (insertError) {
                        console.error('Error creating profile in Supabase:', insertError);
                    }
                }

                return true;
            } catch (err) {
                console.error('Critical error in signIn callback:', err);
                return true;
            }
        },
        async session({ session, token }) {
            if (session.user?.email) {
                // Use service role key to ensure we can read the profile regardless of RLS
                const supabaseAdmin = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                );

                const { data } = await supabaseAdmin
                    .from('profiles')
                    .select('*, schools(name)')
                    .eq('email', session.user.email)
                    .single();

                if (data) {
                    session.user = {
                        ...session.user,
                        ...data,
                        schoolName: data.schools?.name
                    };
                }
            }
            return session;
        },
    },
});

export { handler as GET, handler as POST };
