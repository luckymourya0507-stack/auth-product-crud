import { useState } from 'react'
import { api } from '../api/client'
import FormField, { errorsToMap } from './FormField'

const empty = { name: '', description: '', price: '', stock: '', category: '' }

// Used for both "add" (no product prop) and "edit" (product prop pre-fills the form).
export default function ProductForm({ product, onSaved, onCancel }) {
  const isEdit = Boolean(product)
  const [form, setForm] = useState(
    isEdit
      ? {
          name: product.name,
          description: product.description || '',
          price: String(product.price),
          stock: String(product.stock),
          category: product.category || '',
        }
      : empty
  )
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    setSubmitting(true)
    try {
      // Send raw strings; the backend (express-validator) validates and converts the numbers.
      if (isEdit) {
        await api(`/products/${product._id}`, { method: 'PUT', body: form })
      } else {
        await api('/products', { method: 'POST', body: form })
      }
      onSaved()
    } catch (err) {
      setFieldErrors(errorsToMap(err.errors))
      setError(err.errors?.length ? '' : err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="card product-form" onSubmit={onSubmit} noValidate>
      <h2>{isEdit ? 'Edit product' : 'Add product'}</h2>
      <div className="grid-2">
        <FormField label="Name" name="name" value={form.name} onChange={onChange} error={fieldErrors.name} />
        <FormField label="Category" name="category" value={form.category} onChange={onChange} error={fieldErrors.category} />
        <FormField label="Price" name="price" type="number" step="0.01" min="0" value={form.price} onChange={onChange} error={fieldErrors.price} />
        <FormField label="Stock" name="stock" type="number" step="1" min="0" value={form.stock} onChange={onChange} error={fieldErrors.stock} />
      </div>
      <FormField label="Description" name="description" as="textarea" rows="3" value={form.description} onChange={onChange} error={fieldErrors.description} />
      {error && <p className="alert alert-error">{error}</p>}
      <div className="row">
        <button className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Add product'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}
