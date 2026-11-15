import { Router } from 'express'
import {
  createProductRules,
  updateProductRules,
  productIdRules,
  listProductRules,
} from '../validators/product.validators.js'
import { validate } from '../middleware/validate.js'
import { authenticate } from '../middleware/authenticate.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import {
  createProduct,
  listProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller.js'

const router = Router()

// Public reads
router.get('/', listProductRules, validate, asyncHandler(listProducts))
router.get('/:id', productIdRules, validate, asyncHandler(getProduct))

// Protected writes: authenticate runs first, so no token = 401 before anything else happens
router.post('/', authenticate, createProductRules, validate, asyncHandler(createProduct))
router.put('/:id', authenticate, updateProductRules, validate, asyncHandler(updateProduct))
router.delete('/:id', authenticate, productIdRules, validate, asyncHandler(deleteProduct))

export default router
