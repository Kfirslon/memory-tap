import { Router } from 'express';
import { uploadAudio, transcribe } from '../controllers/audio.controller';
import { upload } from '../config/multer';

const router = Router();

router.post('/upload_audio', upload.single('audio'), uploadAudio);
router.post('/transcribe', transcribe);

export default router;
