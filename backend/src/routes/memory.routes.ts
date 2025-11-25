import { Router } from 'express';
import { createMemory, getMemories, searchMemories, getMemoryById, updateMemory } from '../controllers/memory.controller';

const router = Router();

router.post('/create_memory', createMemory);
router.get('/memories', getMemories);
router.get('/memories/:id', getMemoryById);
router.put('/memories/:id', updateMemory);
router.post('/search', searchMemories);

export default router;
