import { Router } from 'express';
import authRoutes from './auth.routes';
import blogRoutes from './blog.routes';
import publicRoutes from './public.routes';

const router = Router();

router.get('/health', (_req, res) => res.json({ success: true, message: 'ok' }));
router.use('/auth', authRoutes);
router.use('/blogs', blogRoutes);
router.use('/public', publicRoutes);

export default router;
