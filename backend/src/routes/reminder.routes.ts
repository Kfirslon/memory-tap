import { Router } from 'express';
import { createReminder, getReminders } from '../controllers/reminder.controller';

const router = Router();

router.post('/create_reminder', createReminder);
router.get('/reminders', getReminders);

export default router;
