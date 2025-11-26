import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';

const router = Router();

// Initiate Google OAuth flow
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req: Request, res: Response) => {
        // Successful authentication, redirect to frontend (adjust port if needed)
        res.redirect('http://localhost:8080');
    }
);

// Check authentication status
router.get('/check', (req: Request, res: Response) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
        // @ts-ignore – user type is any
        res.json({ authenticated: true, user: (req as any).user });
    } else {
        res.json({ authenticated: false });
    }
});

// Logout route – destroy session
router.post('/logout', (req: Request, res: Response, next: NextFunction) => {
    // req.logout is added by passport
    // @ts-ignore – types may be missing
    req.logout?.((err: any) => {
        if (err) return next(err);
        // Destroy session manually (cast to any for typing)
        (req as any).session?.destroy((err: any) => {
            if (err) return next(err);
            res.clearCookie('connect.sid');
            res.json({ success: true });
        });
    });
});

export default router;
