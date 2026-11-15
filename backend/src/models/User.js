import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // select:false -> these fields are NOT returned by queries unless explicitly requested
    password: { type: String, required: true, select: false },
    refreshTokenHash: { type: String, default: null, select: false },
  },
  { timestamps: true }
)

// Safety net: even if a document with sensitive fields is serialised, strip them.
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password
    delete ret.refreshTokenHash
    delete ret.__v
    return ret
  },
})

export default mongoose.model('User', userSchema)
