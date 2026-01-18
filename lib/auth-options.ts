import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createClient } from '@supabase/supabase-js';

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            console.log('SignIn callback triggered for:', user.email);
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
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
            }

            // Update token if session is updated
            if (trigger === "update") {
                // Force fetch from Supabase to ensure fresh data
                const supabaseAdmin = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                );

                const { data } = await supabaseAdmin
                    .from('profiles')
                    .select('*, schools(name)')
                    .eq('email', token.email)
                    .single();

                if (data) {
                    return {
                        ...token,
                        role: data.role,
                        schoolName: data.schools?.name,
                        full_name: data.full_name,
                        id: data.id,
                        ...session?.user // Allow client to pass other updates if needed
                    };
                }
            }

            // Try to fetch profile data to persist in token
            if (token.email && !token.role) {
                const supabaseAdmin = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                );

                const { data } = await supabaseAdmin
                    .from('profiles')
                    .select('*, schools(name)')
                    .eq('email', token.email)
                    .single();

                if (data) {
                    token.role = data.role;
                    token.schoolName = data.schools?.name;
                    token.full_name = data.full_name;
                    token.id = data.id;
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                // Pass data from token to session
                session.user = {
                    ...session.user,
                    id: token.id as string,
                    role: token.role as string,
                    schoolName: token.schoolName as string,
                    full_name: token.full_name as string
                };
            }
            return session;
        },
    },
};
