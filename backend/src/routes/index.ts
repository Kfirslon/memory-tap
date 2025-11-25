import { Router } from 'express';
import audioRoutes from './audio.routes';
import memoryRoutes from './memory.routes';
import reminderRoutes from './reminder.routes';

const router = Router();

router.use('/', audioRoutes);
router.use('/', memoryRoutes);
router.use('/', reminderRoutes);

export default router;
