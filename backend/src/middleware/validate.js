import { validationResult } from 'express-validator'

// Runs AFTER the express-validator rule chains and BEFORE the controller.
// If any rule failed, respond 400 with a field-level error list so the API consumer
// knows exactly which field failed and why. The controller never runs for bad input.
export const validate = (req, res, next) => {
  const result = validationResult(req)
  if (result.isEmpty()) return next()

  const errors = result.array({ onlyFirstError: true }).map((e) => ({
    field: e.path,
    message: e.msg,
  }))
  return res.status(400).json({ message: 'Validation failed', errors })
}
