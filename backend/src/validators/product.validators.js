import { body, param, query } from 'express-validator'

// Used by both POST (create) and PUT (full update).
const productBodyRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),

  body('description')
    .optional()
    .isString().withMessage('Description must be text')
    .trim()
    .isLength({ max: 1000 }).withMessage('Description can be at most 1000 characters'),

  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a number, 0 or greater')
    .toFloat(),

  body('stock')
    .notEmpty().withMessage('Stock is required')
    .isInt({ min: 0 }).withMessage('Stock must be a whole number, 0 or greater')
    .toInt(),

  body('category')
    .optional()
    .isString().withMessage('Category must be text')
    .trim()
    .isLength({ max: 50 }).withMessage('Category can be at most 50 characters'),
]

// Validates :id BEFORE we query the database (a malformed id would otherwise throw a CastError).
const idRule = param('id').isMongoId().withMessage('Invalid product id')

export const createProductRules = productBodyRules
export const updateProductRules = [idRule, ...productBodyRules]
export const productIdRules = [idRule]

export const listProductRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a whole number, 1 or greater').toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100').toInt(),
]
