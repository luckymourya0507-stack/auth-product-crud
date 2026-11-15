import { Router } from 'express'
import { registerRules, loginRules } from '../validators/auth.validators.js'
import { validate } from '../middleware/validate.js'
import { authenticate } from '../middleware/authenticate.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { register, login, refreshToken, logout, me } from '../controllers/auth.controller.js'

const router = Router()

// Order matters: rules -> validate -> (authenticate) -> controller
router.post('/register', registerRules, validate, asyncHandler(register))
router.post('/login', loginRules, validate, asyncHandler(login))
router.post('/refresh-token', asyncHandler(refreshToken))
router.post('/logout', authenticate, asyncHandler(logout))
router.get('/me', authenticate, asyncHandler(me))

export default router
