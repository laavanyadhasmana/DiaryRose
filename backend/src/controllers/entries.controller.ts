// src/controllers/entries.controller.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { EntriesService } from '../services/entries.service';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware';
import { EntryType, EntryPrivacy } from '@prisma/client';

const entriesService = new EntriesService();

export const createEntryValidation = [
  body('type').isIn(['WRITTEN', 'VIDEO']).withMessage('Invalid entry type'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('privacy')
    .isIn(['PRIVATE', 'PUBLIC'])
    .withMessage('Invalid privacy setting'),
  validate
];

export const createEntry = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const entry = await entriesService.createEntry(req.user!.id, req.body);

    res.status(201).json({
      status: 'success',
      data: { entry }
    });
  } catch (error) {
    next(error);
  }
};

export const getEntries = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const filters = {
      type: req.query.type as EntryType,
      privacy: req.query.privacy as EntryPrivacy,
      mood: req.query.mood as string,
      search: req.query.search as string,
      tags: req.query.tags
        ? (req.query.tags as string).split(',')
        : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      sortBy: (req.query.sortBy as 'newest' | 'oldest') || 'newest'
    };

    const result = await entriesService.getEntries(req.user!.id, filters);

    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getEntry = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const entry = await entriesService.getEntryById(
      req.user!.id,
      req.params.id
    );

    res.json({
      status: 'success',
      data: { entry }
    });
  } catch (error) {
    next(error);
  }
};

export const updateEntry = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const entry = await entriesService.updateEntry(
      req.user!.id,
      req.params.id,
      req.body
    );

    res.json({
      status: 'success',
      data: { entry }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEntry = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await entriesService.deleteEntry(
      req.user!.id,
      req.params.id
    );

    res.json({
      status: 'success',
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await entriesService.getStats(req.user!.id);

    res.json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

export const getOnThisDay = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const entries = await entriesService.getOnThisDayEntries(req.user!.id);

    res.json({
      status: 'success',
      data: { entries }
    });
  } catch (error) {
    next(error);
  }
};