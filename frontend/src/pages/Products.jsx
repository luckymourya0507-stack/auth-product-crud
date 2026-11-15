import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import ProductCard from '../components/ProductCard'
import ProductForm from '../components/ProductForm'

const PAGE_SIZE = 6

export default function Products() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formState, setFormState] = useState(null) // null = hidden, {} = adding, {product} = editing

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api(`/products?page=${page}&limit=${PAGE_SIZE}`)
      setProducts(data.products)
      setPagination(data.pagination)
      // If the last item on the last page was deleted, step back one page.
      if (data.products.length === 0 && page > 1) setPage(page - 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    load()
  }, [load])

  const handleSaved = () => {
    setFormState(null)
    load()
  }

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return
    try {
      await api(`/products/${product._id}`, { method: 'DELETE' })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Products</h1>
          <p className="muted">{pagination.total} item{pagination.total === 1 ? '' : 's'}</p>
        </div>
        {user && !formState && (
          <button className="btn btn-primary" onClick={() => setFormState({})}>+ Add product</button>
        )}
      </div>

      {formState && (
        <ProductForm
          key={formState.product?._id || 'new'}
          product={formState.product}
          onSaved={handleSaved}
          onCancel={() => setFormState(null)}
        />
      )}

      {error && <p className="alert alert-error">{error}</p>}
      {loading && <p className="muted">Loading products...</p>}
      {!loading && !error && products.length === 0 && (
        <p className="card empty">No products yet.{user ? ' Add the first one!' : ' Log in to add one.'}</p>
      )}

      <div className="grid">
        {products.map((p) => (
          <ProductCard
            key={p._id}
            product={p}
            canEdit={Boolean(user)}
            onEdit={(product) => setFormState({ product })}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="pager">
          <button className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span className="muted">Page {pagination.page} of {pagination.totalPages}</span>
          <button className="btn btn-ghost" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </section>
  )
}
