import express from 'express';
import authRoutes from './auth.js';
import twitterRoutes from './twitter.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/auth/twitter', twitterRoutes);

export default router;