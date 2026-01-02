// src/routes/entries.routes.ts
import { Router } from 'express';
import {
  createEntry,
  createEntryValidation,
  getEntries,
  getEntry,
  updateEntry,
  deleteEntry,
  getStats,
  getOnThisDay
} from '../controllers/entries.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', createEntryValidation, createEntry);
router.get('/', getEntries);
router.get('/stats', getStats);
router.get('/on-this-day', getOnThisDay);
router.get('/:id', getEntry);
router.patch('/:id', updateEntry);
router.delete('/:id', deleteEntry);

export default router;

