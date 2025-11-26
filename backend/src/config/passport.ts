import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { supabase } from '../services/supabase.service';
import dotenv from 'dotenv';

dotenv.config();

passport.serializeUser((user: any, done) => {
    done(null, user);
});

passport.deserializeUser((user: any, done) => {
    done(null, user);
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            callbackURL: '/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user exists in Supabase
                const { data: existingUser, error: fetchError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('google_id', profile.id)
                    .single();

                if (existingUser) {
                    return done(null, existingUser);
                }

                // Create new user
                const { data: newUser, error: createError } = await supabase
                    .from('users')
                    .insert([
                        {
                            google_id: profile.id,
                            email: profile.emails?.[0]?.value,
                            name: profile.displayName,
                            picture: profile.photos?.[0]?.value,
                        },
                    ])
                    .select()
                    .single();

                if (createError) {
                    console.error('Error creating user:', createError);
                    return done(createError, undefined);
                }

                return done(null, newUser);
            } catch (error) {
                console.error('Auth error:', error);
                return done(error as any, undefined);
            }
        }
    )
);

export default passport;
