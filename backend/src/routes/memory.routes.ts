import { Router } from 'express';
import { createMemory, getMemories, searchMemories, getMemoryById, updateMemory, deleteMemory, toggleFavorite } from '../controllers/memory.controller';

const router = Router();

router.post('/create_memory', createMemory);
router.get('/memories', getMemories);
router.get('/memories/:id', getMemoryById);
router.put('/memories/:id', updateMemory);
router.delete('/memories/:id', deleteMemory);
router.post('/memories/:id/favorite', toggleFavorite);
router.post('/search', searchMemories);

export default router;
