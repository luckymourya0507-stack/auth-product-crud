export default function ProductCard({ product, canEdit, onEdit, onDelete }) {
  return (
    <article className="card product-card">
      <div className="product-top">
        <h3>{product.name}</h3>
        {product.category && <span className="tag">{product.category}</span>}
      </div>
      <p className="product-desc">{product.description || 'No description'}</p>
      <div className="product-meta">
        <strong className="price">₹{Number(product.price).toLocaleString('en-IN')}</strong>
        <span className={product.stock > 0 ? 'stock' : 'stock stock-out'}>
          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
        </span>
      </div>
      {canEdit && (
        <div className="row">
          <button className="btn btn-ghost" onClick={() => onEdit(product)}>Edit</button>
          <button className="btn btn-danger" onClick={() => onDelete(product)}>Delete</button>
        </div>
      )}
    </article>
  )
}
