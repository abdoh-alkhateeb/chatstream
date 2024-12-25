import { Router } from 'express';
import ver1Routes from './v1.api.js';
const router = Router();

router.use('/v1', ver1Routes);

export default router;
