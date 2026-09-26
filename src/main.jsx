import React, { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import {
  ArrowLeft, ArrowRight, BadgeCheck, Check, ChevronRight, CircleHelp,
  ClipboardList, FileCheck2, Heart, LayoutDashboard, LogOut, Menu,
  Package, Plus, Search, Settings, ShieldCheck, ShoppingBag, ShoppingCart,
  Store, Trash2, Truck, UserRound, X,
} from "lucide-react"
import "./styles.css"

const dataElement = document.getElementById("setu-data")
const data = dataElement ? JSON.parse(dataElement.textContent || "{}") : {}
const path = window.location.pathname
const idOf = (item) => item?._id?.toString?.() || item?._id || item?.id || item?.productId || ""
const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value) || 0)

function Button({ href, kind = "primary", icon: Icon, children, ...props }) {
  const className = `button button-${kind}${props.className ? ` ${props.className}` : ""}`
  return href ? <a className={className} href={href} {...props}>{Icon && <Icon size={17} />}{children}</a> : <button className={className} {...props}>{Icon && <Icon size={17} />}{children}</button>
}

function Notice({ error, children }) {
  if (!children || (Array.isArray(children) && !children.length)) return null
  return <div className={`notice ${error ? "notice-error" : "notice-success"}`} role="status">{Array.isArray(children) ? children.join(" ") : children}</div>
}

function Header({ user, admin, cartCount = 0 }) {
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(cartCount)
  const agency = user?.role === "agency" || path.startsWith("/agency")
  const isAdmin = admin || path.startsWith("/admin")
  const links = isAdmin
    ? [["Overview", "/admin/dashboard", LayoutDashboard], ["Agencies", "/admin/agencies", Store]]
    : agency
      ? [["Overview", "/agency/dashboard", LayoutDashboard], ["Products", "/agency/products", Package], ["Orders", "/agency/orders", ClipboardList], ["Verification", "/agency/verification", FileCheck2]]
      : [["Shop", "/customer/browsing", ShoppingBag], ["Orders", "/customer/orders", Package], ["Support", "/customer/support", CircleHelp]]
  const account = isAdmin ? "/admin/dashboard" : agency ? "/agency/dashboard" : "/customer/dashboard"
  useEffect(() => {
    const syncCount = (event) => setCount(event.detail)
    window.addEventListener("setu-cart-count", syncCount)
    if (user?.role === "customer") {
      fetch("/api/cart/count").then((response) => response.json()).then((result) => {
        if (result.success) setCount(result.count)
      }).catch(() => {})
    }
    return () => window.removeEventListener("setu-cart-count", syncCount)
  }, [user])
  return <header className="site-header"><div className="header-inner">
    <a className="brand" href="/"><span className="brand-mark">S</span>SETU</a>
    <button className="icon-button menu-toggle" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X /> : <Menu />}</button>
    <nav className={open ? "main-nav is-open" : "main-nav"}>{links.map(([label, href, Icon]) => <a href={href} key={href}><Icon size={16} />{label}</a>)}</nav>
    <div className="header-actions">{!agency && !isAdmin && <a href="/customer/cart" className="icon-button cart-link" aria-label={`Cart, ${count} items`}><ShoppingCart /><span className="cart-count">{count}</span></a>}
      {user ? <><a className="account-link" href={account}><UserRound size={17} /><span>{user.name?.split(" ")[0] || "Account"}</span></a><a className="icon-button" href={isAdmin ? "/admin/logout" : "/auth/logout"} aria-label="Sign out"><LogOut size={17} /></a></> : <><a className="quiet-link" href="/auth/customer/login">Sign in</a><Button href="/auth/customer/register" kind="small">Create account</Button></>}</div>
  </div></header>
}

function Footer() {
  return <footer className="site-footer"><div className="footer-inner"><a className="brand" href="/"><span className="brand-mark">S</span>SETU</a><p>Verified goods. Fair prices. A second life for quality products.</p><nav><a href="/about">About</a><a href="/support">Support</a><a href="/terms">Terms</a><a href="/privacy">Privacy</a></nav><small>© {new Date().getFullYear()} SETU</small></div></footer>
}

function Frame({ children, user, admin, cartCount, narrow = false }) {
  return <><Header user={user} admin={admin} cartCount={cartCount ?? data.cartCount ?? 0} /><main className={`page-frame${narrow ? " page-narrow" : ""}`}>
    {data.success_msg?.length > 0 && <Notice>{data.success_msg}</Notice>}
    {data.error_msg?.length > 0 && <Notice error>{data.error_msg}</Notice>}
    {children}
  </main><Footer /></>
}

function ProductCard({ product, authenticated, wishlisted = false }) {
  const [notice, setNotice] = useState("")
  const [busy, setBusy] = useState(false)
  const productId = idOf(product)
  async function add() {
    setBusy(true)
    try {
      const api = authenticated ? "/api/cart/add" : "/customer/cart/add"
      const body = authenticated ? { productId, quantity: 1 } : { productId, name: product.name, price: product.price, image: product.image, quantity: 1 }
      const result = await fetch(api, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((response) => response.json())
      if (result.success) {
        setNotice("Added to cart")
        if (typeof result.cartCount === "number") window.dispatchEvent(new CustomEvent("setu-cart-count", { detail: result.cartCount }))
      }
      else setNotice(result.message || "Could not add this item")
    } catch { setNotice("Could not add this item. Please try again.") }
    setBusy(false)
  }
  const comparePrice = product.compareAtPrice || product.originalPrice
  return <article className="product-card"><a href={`/customer/product/${productId}`} className="product-media"><img src={product.image || "/api/placeholder/400/320"} alt={product.name} loading="lazy" />{product.seizureProof && <span className="verified-tag"><ShieldCheck size={13} /> Verified origin</span>}</a><div className="product-info"><div className="product-meta"><span>{product.category || "Electronics"}</span><span>{product.condition || "Condition not listed"}</span></div><a className="product-title" href={`/customer/product/${productId}`}>{product.name}</a><div className="product-rating"><span className="stars">☆☆☆☆☆</span><span>Not yet rated</span></div><div className="product-price"><strong>{money(product.price)}</strong>{comparePrice && Number(comparePrice) > Number(product.price) ? <del>{money(comparePrice)}</del> : <small>Fixed price</small>}</div><p className="stock-label">{product.stock > 0 ? `${product.stock} available` : "Unavailable"}</p><div className="product-actions"><Button kind="add" icon={busy ? Check : ShoppingCart} onClick={add} disabled={busy || !product.stock}>{busy ? "Adding..." : "Add to cart"}</Button>{authenticated ? <form action={`/customer/wishlist/${wishlisted ? "remove" : "add"}/${productId}`} method="POST"><button className="icon-button heart-button" title={wishlisted ? "Remove from wishlist" : "Add to wishlist"} aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}><Heart size={18} fill={wishlisted ? "currentColor" : "none"} /></button></form> : <a className="icon-button heart-button" href="/auth/customer/login" title="Sign in to save items" aria-label="Sign in to save item"><Heart size={18} /></a>}</div>{notice && <small className="inline-notice">{notice}</small>}</div></article>
}

function Empty({ title = "Nothing here yet", detail = "There is no information to display right now.", href, action = "Continue shopping" }) {
  return <div className="empty-state"><Package size={30} /><h2>{title}</h2><p>{detail}</p>{href && <Button href={href}>{action}</Button>}</div>
}

function ProductGrid({ products = [], authenticated, wishlisted = false }) {
  return products.length ? <div className="product-grid">{products.map((item) => <ProductCard key={idOf(item)} product={item} authenticated={authenticated} wishlisted={wishlisted} />)}</div> : <Empty title="No listings found" detail="Try another category or check back soon for new products." href="/customer/browsing" />
}

function Home() {
  return <Frame user={data.user}><section className="home-intro"><div><span className="eyebrow"><BadgeCheck size={15} /> VERIFIED MARKETPLACE</span><h1>Good finds.<br /><em>Second chances.</em></h1><p>Shop inspected goods from verified agencies. Clear condition details, fixed prices, and a straightforward checkout.</p><div className="intro-actions"><Button href="/customer/browsing" icon={ArrowRight}>Shop all products</Button><a className="text-link" href="/about">How SETU works <ChevronRight size={16} /></a></div><div className="trust-row"><span><ShieldCheck size={16} /> Verified sellers</span><span><FileCheck2 size={16} /> Transparent sourcing</span><span><Truck size={16} /> Tracked orders</span></div></div><aside className="home-side"><strong>A more considered way to shop</strong><div><b>01</b><span>Browse verified listings</span></div><div><b>02</b><span>Choose with confidence</span></div><div><b>03</b><span>Give useful goods another life</span></div><a href="/auth/agency/register">Are you an agency? Apply to sell <ArrowRight size={15} /></a></aside></section><section className="section-block"><div className="section-heading"><div><span className="eyebrow">CURATED INVENTORY</span><h2>Recently listed</h2></div><a className="text-link" href="/customer/browsing">See all <ArrowRight size={16} /></a></div><ProductGrid products={data.products || []} authenticated={Boolean(data.user)} /></section><section className="assurance-strip"><div><ShieldCheck /><span><strong>Verified agencies</strong><small>Listings from screened sellers</small></span></div><div><FileCheck2 /><span><strong>Clear provenance</strong><small>Origin information where available</small></span></div><div><Package /><span><strong>Fixed prices</strong><small>No bidding or surprise fees</small></span></div></section></Frame>
}

function Catalog() {
  const categories = [["all", "All products"], ["electronics", "Electronics"], ["mobile", "Mobile"], ["laptops", "Laptops"], ["cameras", "Cameras"], ["home", "Home"]]
  return <Frame user={data.user}><div className="catalog-head"><div><span className="eyebrow">SETU MARKETPLACE</span><h1>{data.searchTerm ? `Results for “${data.searchTerm}”` : "Browse products"}</h1><p>Compare listings by condition, price, and source.</p></div><form className="search-form" action="/customer/search" method="POST"><Search size={18} /><input name="searchTerm" defaultValue={data.searchTerm} aria-label="Search products" placeholder="Search products" /><button aria-label="Submit search"><ArrowRight size={18} /></button></form></div><div className="catalog-layout"><aside className="category-rail"><h2>Categories</h2>{categories.map(([key, label]) => <a className={(data.activeTab || "all") === key ? "selected" : ""} href={key === "all" ? "/customer/browsing" : `/customer/browsing/${key}`} key={key}>{label}<ChevronRight size={14} /></a>)}</aside><section><div className="results-bar">{data.products?.length || 0} listings <span>Recently added</span></div><ProductGrid products={data.products || []} authenticated={Boolean(data.user)} /></section></div></Frame>
}

function Field({ name, label, type = "text", as = "input", value, required, options = [], ...props }) {
  return <label className="field" htmlFor={name}><span>{label}{required && " *"}</span>{as === "textarea" ? <textarea id={name} name={name} defaultValue={value} required={required} {...props} /> : as === "select" ? <select id={name} name={name} defaultValue={value || ""} required={required} {...props}><option value="" disabled>Select an option</option>{options.map((option) => { const [optionValue, optionLabel] = Array.isArray(option) ? option : [option, option]; return <option key={optionValue} value={optionValue}>{optionLabel}</option> })}</select> : <input id={name} name={name} type={type} defaultValue={value} required={required} {...props} />}</label>
}

function Auth({ mode, role = "customer" }) {
  const agency = role === "agency"
  const login = mode === "login"
  const action = `/auth/${role}/${login ? "login" : "register"}`
  return <Frame narrow><div className="auth-layout"><aside className="auth-aside"><a className="brand" href="/"><span className="brand-mark">S</span>SETU</a><span className="eyebrow">{agency ? "SELL WITH SETU" : "A MARKETPLACE WITH PURPOSE"}</span><h1>{agency ? "Bring quality goods back into circulation." : "Find something useful. Give it another life."}</h1><p>{agency ? "A supported way to list and manage verified inventory." : "Discover goods listed by verified agencies."}</p><div className="auth-points"><span><ShieldCheck /> Verified listings</span><span><FileCheck2 /> Transparent sourcing</span></div></aside><section className="auth-panel"><div className="auth-title"><span className="eyebrow">{login ? "WELCOME BACK" : "GET STARTED"}</span><h2>{login ? `${agency ? "Agency" : "Customer"} sign in` : `${agency ? "Agency" : "Customer"} account`}</h2><p>{login ? "Enter your account details to continue." : "Create an account to continue."}</p></div>{data.errors?.length > 0 && <Notice error>{data.errors.map((item) => item.msg || item)}</Notice>}<form className="form-stack" action={action} method="POST">
    <label className="field"><span>Account type</span><select value={role} onChange={(event) => window.location.assign(`/auth/${event.target.value}/${login ? "login" : "register"}`)}><option value="customer">Customer</option><option value="agency">Agency</option></select></label>
    {!login && agency && <><Field name="agencyName" label="Agency name" value={data.agencyName} required /><Field name="businessType" label="Business type" as="select" value={data.businessType} options={[["sole_proprietorship", "Sole proprietorship"], ["partnership", "Partnership"], ["llc", "Limited liability company (LLC)"], ["corporation", "Corporation"], ["other", "Other"]]} required /><Field name="businessDescription" label="Business description" as="textarea" value={data.businessDescription} required /><div className="form-grid"><Field name="firstName" label="First name" value={data.firstName} required /><Field name="lastName" label="Last name" value={data.lastName} required /></div><div className="form-grid"><Field name="phone" label="Business phone" type="tel" value={data.phone} required /><Field name="position" label="Your position" value={data.position} required /></div><Field name="website" label="Website (optional)" type="url" value={data.website} />
    </>}{!login && !agency && <Field name="name" label="Full name" value={data.name} required />}
    <Field name="email" label="Email address" type="email" value={data.email} required /><Field name="password" label="Password" type="password" required />{!login && <Field name="confirmPassword" label="Confirm password" type="password" required />}{login && <input type="hidden" name="redirect" value={agency ? "/agency/dashboard" : "/customer/browsing"} />}<Button type="submit" className="button-full">{login ? "Sign in" : "Create account"}<ArrowRight size={16} /></Button></form><div className="auth-links">{login ? <><a href={`/auth/${role}/forgot-password`}>Forgot password?</a><span>New to SETU? <a href={`/auth/${role}/register`}>Create an account</a></span></> : <span>Already registered? <a href={`/auth/${role}/login`}>Sign in</a></span>}</div></section></div></Frame>
}

function PasswordPage({ reset = false }) {
  const token = new URLSearchParams(window.location.search).get("token") || data.token || ""
  return <Frame narrow><section className="simple-panel"><span className="eyebrow">ACCOUNT ACCESS</span><h1>{reset ? "Choose a new password" : "Reset your password"}</h1><p>{reset ? "Create a password with at least six characters." : "We’ll send a reset link to your registered email."}</p><form className="form-stack" action={reset ? "/auth/reset-password" : "/auth/forgot-password"} method="POST">{reset ? <><input type="hidden" name="token" value={token} /><Field name="password" label="New password" type="password" required /><Field name="confirmPassword" label="Confirm password" type="password" required /></> : <><Field name="email" label="Email address" type="email" required /><label className="field"><span>Account type</span><select name="userType" defaultValue={data.userType || "customer"}><option value="customer">Customer</option><option value="agency">Agency</option></select></label></>}<Button type="submit">{reset ? "Update password" : "Send reset link"}</Button></form></section></Frame>
}

function ProductDetail() {
  const product = data.product
  const [message, setMessage] = useState("")
  if (!product) return <Frame user={data.user}><Empty title="Listing unavailable" href="/customer/browsing" /></Frame>
  async function add() {
    const api = data.user ? "/api/cart/add" : "/customer/cart/add"
    const body = data.user ? { productId: idOf(product), quantity: 1 } : { productId: idOf(product), name: product.name, price: product.price, image: product.image, quantity: 1 }
    const result = await fetch(api, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((response) => response.json())
    setMessage(result.message || (result.success ? "Added to cart" : "Could not add item"))
    if (result.success && typeof result.cartCount === "number") window.dispatchEvent(new CustomEvent("setu-cart-count", { detail: result.cartCount }))
  }
  return <Frame user={data.user}><div className="breadcrumbs"><a href="/customer/browsing">Marketplace</a><ChevronRight size={14} />{product.category}</div><section className="detail-layout"><div className="detail-image"><img src={product.image || "/api/placeholder/700/540"} alt={product.name} /></div><div className="detail-copy"><span className="eyebrow">{product.category} / {product.condition || "Condition not listed"}</span><h1>{product.name}</h1><div className="product-rating"><span className="stars">☆☆☆☆☆</span>Not yet rated</div><div className="detail-price">{money(product.price)} <small>Fixed price</small></div><p>{product.description}</p><dl className="detail-facts"><div><dt>Condition</dt><dd>{product.condition || "Not provided"}</dd></div><div><dt>Availability</dt><dd>{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</dd></div><div><dt>Source</dt><dd>{product.source || "Not provided"}</dd></div><div><dt>Provenance</dt><dd>{product.seizureProof ? "Verified" : "Not indicated"}</dd></div></dl><Button icon={ShoppingCart} onClick={add} disabled={!product.stock}>Add to cart</Button>{message && <Notice>{message}</Notice>}</div></section>{data.relatedProducts?.length > 0 && <section className="section-block"><div className="section-heading"><h2>Related listings</h2></div><ProductGrid products={data.relatedProducts} authenticated={Boolean(data.user)} /></section>}</Frame>
}

function CartPage() {
  const initial = data.cart || []
  const [items, setItems] = useState(Array.isArray(initial) ? initial : initial.items || [])
  const [error, setError] = useState("")
  const authenticated = Boolean(data.user)
  const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0)
  async function change(item, quantity, remove = false) {
    const productId = item.productId || idOf(item.product) || item.product
    const endpoint = authenticated ? remove ? `/api/cart/remove/${productId}` : "/api/cart/update" : remove ? "/customer/cart/remove" : "/customer/cart/update"
    const response = await fetch(endpoint, { method: authenticated ? remove ? "DELETE" : "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: remove && authenticated ? undefined : JSON.stringify({ productId, quantity }) })
    const result = await response.json()
    if (!result.success) return setError(result.message || "Cart update failed")
    const nextCount = result.cart?.totalItems ?? result.cartCount
    if (typeof nextCount === "number") window.dispatchEvent(new CustomEvent("setu-cart-count", { detail: nextCount }))
    setItems((current) => remove || quantity < 1 ? current.filter((row) => (row.productId || idOf(row.product) || row.product) !== productId) : current.map((row) => (row.productId || idOf(row.product) || row.product) === productId ? { ...row, quantity } : row))
  }
  const shipping = authenticated ? 50 : 5
  return <Frame user={data.user}><div className="page-heading"><span className="eyebrow">YOUR SELECTION</span><h1>Shopping cart</h1><p>{items.length} {items.length === 1 ? "item" : "items"}</p></div>{error && <Notice error>{error}</Notice>}{!items.length ? <Empty title="Your cart is empty" detail="Browse the marketplace to find your next useful purchase." href="/customer/browsing" /> : <div className="cart-layout"><section className="cart-list">{items.map((item) => { const productId = item.productId || idOf(item.product) || item.product; return <article className="cart-item" key={productId}><a href={`/customer/product/${productId}`}><img src={item.image || item.product?.image || "/api/placeholder/160/140"} alt={item.name || item.product?.name} /></a><div><a className="product-title" href={`/customer/product/${productId}`}>{item.name || item.product?.name}</a><p>Fixed price</p><strong>{money(item.price)}</strong></div><div className="quantity-control"><button onClick={() => change(item, Number(item.quantity) - 1)} aria-label="Decrease">−</button><span>{item.quantity}</span><button onClick={() => change(item, Number(item.quantity) + 1)} aria-label="Increase">+</button></div><button className="icon-button remove-button" onClick={() => change(item, 0, true)} aria-label="Remove item"><Trash2 size={17} /></button></article>})}</section><aside className="summary-panel"><h2>Order summary</h2><div><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div><span>Estimated tax</span><strong>{money(subtotal * .1)}</strong></div><div><span>Shipping</span><strong>{money(shipping)}</strong></div><div className="summary-total"><span>Total</span><strong>{money(subtotal * 1.1 + shipping)}</strong></div><Button href={data.user ? "/customer/checkout" : "/auth/customer/login"} className="button-full">Continue to checkout <ArrowRight size={16} /></Button><a className="text-link" href="/customer/browsing"><ArrowLeft size={15} /> Continue shopping</a></aside></div>}</Frame>
}

function Checkout() {
  const cart = data.cart || {}
  const items = Array.isArray(cart) ? cart : cart.items || []
  const subtotal = Number(data.subtotal ?? items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0))
  return <Frame user={data.user} narrow><div className="page-heading"><span className="eyebrow">SECURE CHECKOUT</span><h1>Delivery details</h1><p>Cash on delivery is available for this order.</p></div>{!items.length ? <Empty title="Your cart is empty" href="/customer/browsing" /> : <div className="checkout-layout"><form className="form-panel" action="/customer/checkout/cash-on-delivery" method="POST"><h2>Shipping address</h2><div className="form-grid"><Field name="firstName" label="First name" value={data.user?.name?.split(" ")[0]} required /><Field name="lastName" label="Last name" value={data.user?.name?.split(" ").slice(1).join(" ")} required /></div><Field name="phone" label="Phone number" type="tel" value={data.user?.phone} required /><Field name="address" label="Street address" required /><div className="form-grid"><Field name="city" label="City" required /><Field name="state" label="State" required /></div><div className="form-grid"><Field name="zip" label="Postal code" required /><Field name="country" label="Country" value="India" required /></div><div className="payment-choice"><Check /><span><strong>Cash on delivery</strong><small>Pay when your order arrives</small></span></div><Button type="submit" className="button-full">Place order <ArrowRight size={16} /></Button></form><aside className="summary-panel"><h2>Order summary</h2>{items.map((item) => <div key={idOf(item.product) || item.productId}><span>{item.name || item.product?.name} × {item.quantity}</span><strong>{money(item.price * item.quantity)}</strong></div>)}<div><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div><span>Tax</span><strong>{money(data.tax || subtotal * .1)}</strong></div><div><span>Shipping</span><strong>{money(data.shipping || 50)}</strong></div><div className="summary-total"><span>Total</span><strong>{money(data.total || subtotal * 1.1 + 50)}</strong></div></aside></div>}</Frame>
}

function Portal({ title, subtitle, user, admin = false, children }) {
  const agency = path.startsWith("/agency")
  const links = admin ? [["Overview", "/admin/dashboard", LayoutDashboard], ["Agencies", "/admin/agencies", Store]] : agency ? [["Overview", "/agency/dashboard", LayoutDashboard], ["Products", "/agency/products", Package], ["Orders", "/agency/orders", ClipboardList], ["Verification", "/agency/verification", FileCheck2], ["Settings", "/agency/settings", Settings], ["Support", "/agency/support", CircleHelp]] : [["Overview", "/customer/dashboard", LayoutDashboard], ["Orders", "/customer/orders", Package], ["Wishlist", "/customer/wishlist", Heart], ["Settings", "/customer/settings", Settings], ["Support", "/customer/support", CircleHelp]]
  return <Frame user={user} admin={admin}><div className="portal-layout"><aside className="portal-sidebar"><div className="profile-mini"><span className="avatar">{user?.name?.[0] || "S"}</span><span><strong>{user?.name || "SETU"}</strong><small>{user?.role || "account"}</small></span></div><nav>{links.map(([label, href, Icon]) => <a className={path === href ? "active" : ""} href={href} key={href}><Icon size={17} />{label}<ChevronRight size={14} /></a>)}</nav></aside><section className="portal-content"><div className="page-heading"><span className="eyebrow">{admin ? "ADMINISTRATION" : agency ? "AGENCY PORTAL" : "YOUR ACCOUNT"}</span><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{children}</section></div></Frame>
}

function Stat({ label, value, icon: Icon }) {
  return <article className="stat-card"><span className="stat-icon"><Icon size={19} /></span><span>{label}</span><strong>{value}</strong></article>
}

function OrdersTable({ orders = [], customer = true }) {
  if (!orders.length) return <Empty title="No orders yet" detail="Your order activity will appear here." href="/customer/browsing" />
  return <div className="table-wrap"><table><thead><tr><th>Order</th><th>Date</th><th>Status</th><th>Total</th><th></th></tr></thead><tbody>{orders.map((order) => <tr key={idOf(order)}><td>{order.orderId || `#${idOf(order).slice(-7)}`}</td><td>{new Date(order.createdAt).toLocaleDateString()}</td><td><span className="status-pill">{order.status || "Processing"}</span></td><td>{money(order.totalAmount || order.total || 0)}</td><td><a href={`${customer ? "/customer" : "/agency"}/orders/${idOf(order)}`} aria-label="View order"><ChevronRight size={17} /></a></td></tr>)}</tbody></table></div>
}

function CustomerDashboard() {
  const user = data.user
  return <Portal user={user} title={`Welcome back, ${user?.name?.split(" ")[0] || "there"}`} subtitle="A quick look at your account and recent activity."><div className="stat-grid"><Stat label="Orders placed" value={data.stats?.totalOrders ?? data.totalOrders ?? data.recentOrders?.length ?? 0} icon={Package} /><Stat label="Total spent" value={money(data.stats?.totalSpent ?? data.totalSpent)} icon={ShoppingBag} /><Stat label="Account status" value="Active" icon={BadgeCheck} /></div><section className="table-section"><div className="section-heading"><h2>Recent orders</h2><a className="text-link" href="/customer/orders">View all <ArrowRight size={15} /></a></div><OrdersTable orders={data.recentOrders || []} /></section></Portal>
}

function OrderDetail() {
  const order = data.order
  const agency = path.startsWith("/agency")
  if (!order) return <Portal user={data.user} title="Order details"><Empty title="Order unavailable" href={agency ? "/agency/orders" : "/customer/orders"} /></Portal>
  return <Portal user={data.user || data.agency} title={`Order ${order.orderId || "details"}`} subtitle={`Placed ${new Date(order.createdAt).toLocaleDateString()}`}><div className="detail-columns"><section className="table-section"><h2>Items</h2>{(data.agencyItems?.length ? data.agencyItems : order.items || []).map((item, index) => <div className="order-line" key={idOf(item.product) || index}><img src={item.image || item.product?.image || "/api/placeholder/100/100"} alt="" /><div><strong>{item.name || item.product?.name}</strong><small>Quantity {item.quantity}</small></div><b>{money(item.price * item.quantity)}</b></div>)}</section><aside className="summary-panel"><h2>Order summary</h2><div><span>Status</span><strong>{order.status || "Processing"}</strong></div><div><span>Payment</span><strong>{order.paymentMethod || "Cash on Delivery"}</strong></div><div className="summary-total"><span>Total</span><strong>{money(order.totalAmount || order.total)}</strong></div>{order.shippingAddress && <><h3>Delivery address</h3><p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />{order.shippingAddress.address}<br />{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p></>}</aside></div>{agency && <form className="form-panel status-update-panel" action={`/agency/orders/${idOf(order)}/status`} method="POST"><h2>Update order status</h2><label className="field"><span>Status</span><select name="status" defaultValue={order.status || "pending"}>{["pending", "processing", "shipped", "delivered", "cancelled"].map((value) => <option key={value}>{value}</option>)}</select></label><Field name="note" label="Update note" as="textarea" /><Button type="submit">Save status</Button></form>}</Portal>
}

function SettingsPage() {
  const user = data.user
  const agency = path.startsWith("/agency")
  return <Portal user={user} title={agency ? "Agency settings" : "Account settings"} subtitle="Manage your profile and account security."><div className="settings-grid"><form className="form-panel" action={agency ? "/agency/settings/profile" : "/customer/update-profile"} method="POST"><h2>{agency ? "Agency profile" : "Personal information"}</h2><Field name="name" label={agency ? "Contact name" : "Full name"} value={user?.name} required /><Field name="email" label="Email address" type="email" value={user?.email} required /><Field name="phone" label="Phone number" type="tel" value={user?.phone} />{agency ? <><Field name="agencyName" label="Agency name" value={user?.agencyDetails?.agencyName} /><Field name="businessType" label="Business type" value={user?.agencyDetails?.businessType} /><Field name="website" label="Website" type="url" value={user?.agencyDetails?.website} /><Field name="businessDescription" label="Description" as="textarea" value={user?.agencyDetails?.businessDescription} /></> : <><Field name="dob" label="Date of birth" type="date" value={user?.dob} /><Field name="address" label="Address" as="textarea" value={user?.address} /></>}<Button type="submit">Save changes</Button></form><form className="form-panel" action={agency ? "/agency/settings/password" : "/customer/update-password"} method="POST"><h2>Change password</h2>{agency && <Field name="currentPassword" label="Current password" type="password" required />}{!agency && <Field name="currentPassword" label="Current password" type="password" required />}<Field name={agency ? "newPassword" : "newPassword"} label="New password" type="password" required /><Field name="confirmPassword" label="Confirm new password" type="password" required /><Button type="submit">Update password</Button></form></div></Portal>
}

function SupportPage({ customer = false }) {
  return <Portal user={data.user} title="Support" subtitle="Tell our team how we can help."><form className="form-panel support-form" action={customer ? "/customer/support" : "/agency/support"} method="POST"><h2>Contact support</h2><Field name="name" label="Name" value={data.user?.name} required /><Field name="email" label="Email" type="email" value={data.user?.email} required /><Field name="subject" label="Subject" required /><Field name="message" label="Message" as="textarea" required /><Button type="submit">Send request</Button></form><section className="table-section"><h2>Common questions</h2><details><summary>How are products sourced?</summary><p>Marketplace listings are created by agencies and include source details where available.</p></details><details><summary>How do I track an order?</summary><p>Open the Orders section of your account to see order status.</p></details></section></Portal>
}

function ProductForm({ editing = false }) {
  const product = data.product || {}
  return <Portal user={data.user} title={editing ? "Edit product" : "Add a product"} subtitle="Provide accurate condition, pricing, and provenance details."><form className="form-panel wide-form" action={editing ? `/agency/products/edit/${idOf(product)}` : "/agency/products/add"} method="POST" encType="multipart/form-data"><div className="form-grid"><Field name="name" label="Product name" value={product.name} required /><Field name="category" label="Category" as="select" value={product.category} options={["electronics", "mobile", "laptops", "cameras", "jewelry", "clothing", "home", "other"]} required /></div><Field name="description" label="Description" as="textarea" value={product.description} required /><div className="form-grid"><Field name="condition" label="Condition" as="select" value={product.condition || "good"} options={["excellent", "good", "fair", "poor"]} /><Field name="source" label="Source" as="select" value={product.source || "other"} options={["law-enforcement", "customs", "tax-authority", "bankruptcy", "other"]} /></div><div className="form-grid"><Field name="price" label="Price (INR)" type="number" min="0" step="1" value={product.price} required /><Field name="stock" label="Quantity" type="number" min="0" value={product.stock || 1} required /></div><Field name="image" label="Product image" type="file" accept="image/jpeg,image/png,image/gif" required={!editing} /><label className="check-field"><input type="checkbox" name="seizureProof" defaultChecked={product.seizureProof} /> Supporting provenance documents are available</label><div className="form-actions"><Button href="/agency/products" kind="secondary">Cancel</Button><Button type="submit">{editing ? "Save changes" : "Publish listing"}</Button></div></form></Portal>
}

function AgencyProducts() {
  const products = data.products || []
  return <Portal user={data.user} title="Products" subtitle="Manage your marketplace inventory."><div className="section-heading"><span>{products.length} listings</span><Button href="/agency/products/add" icon={Plus}>Add product</Button></div>{products.length ? <div className="management-list">{products.map((product) => <article className="management-row" key={idOf(product)}><img src={product.image || "/api/placeholder/120/100"} alt="" /><div><strong>{product.name}</strong><small>{product.category} · {product.condition} · {product.stock} available</small></div><b>{money(product.price)}</b><a className="button button-secondary button-small" href={`/agency/products/edit/${idOf(product)}`}>Edit</a><form action={`/agency/products/delete/${idOf(product)}`} method="POST" onSubmit={(event) => !window.confirm("Delete this listing?") && event.preventDefault()}><button className="icon-button" aria-label="Delete listing"><Trash2 size={17} /></button></form></article>)}</div> : <Empty title="No listings yet" detail="Add your first product when your agency is verified." href="/agency/products/add" action="Add product" />}</Portal>
}

function AgencyOrders() {
  const orders = data.orders || []
  return <Portal user={data.user} title="Orders" subtitle="Review and update orders containing your listings.">{orders.length ? <div className="management-list">{orders.map((order) => <article className="management-row" key={idOf(order)}><div><strong>{order.orderId || `Order ${idOf(order).slice(-7)}`}</strong><small>{order.customer?.name || order.user?.name || "Customer"} · {new Date(order.createdAt).toLocaleDateString()}</small></div><span className="status-pill">{order.status || "Pending"}</span><b>{money(order.totalAmount || order.total)}</b><a className="button button-secondary button-small" href={`/agency/orders/${idOf(order)}`}>Review</a></article>)}</div> : <Empty title="No orders received" detail="Orders containing your products will appear here." />}</Portal>
}

function Verification() {
  const types = [["businessRegistration", "Business registration"], ["taxId", "Tax ID"], ["identityProof", "Identity proof"], ["addressProof", "Address proof"]]
  return <Portal user={data.user} title="Agency verification" subtitle="Submit and track the documents required to list products."><div className="verification-callout"><ShieldCheck /><div><strong>{data.user?.isVerified ? "Your agency is verified" : "Verification in progress"}</strong><p>{data.user?.isVerified ? "Your listings are enabled." : "Upload each required document for review."}</p></div></div><div className="document-grid">{types.map(([type, label]) => { const doc = data.user?.documents?.[type] || {}; return <article className="document-card" key={type}><div className="document-heading"><FileCheck2 /><span className="status-pill">{doc.status || "Required"}</span></div><h2>{label}</h2>{doc.path && <a href={doc.path} target="_blank" rel="noreferrer">View submitted document</a>}{doc.rejectionReason && <p className="inline-notice">{doc.rejectionReason}</p>}<form action="/agency/verification/upload" method="POST" encType="multipart/form-data"><input type="hidden" name="documentType" value={type} /><Field name="document" label="Upload PDF, DOC, or image" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" required /><Button type="submit">{doc.path ? "Replace document" : "Upload document"}</Button></form></article>})}</div></Portal>
}

function AgencyDashboard() {
  return <Portal user={data.user} title={`Good day, ${data.user?.name?.split(" ")[0] || "partner"}`} subtitle="Your inventory and order activity at a glance."><div className="stat-grid"><Stat label="Active listings" value={data.productCount || 0} icon={Package} /><Stat label="Orders" value={data.orderCount || 0} icon={ClipboardList} /><Stat label="Gross sales" value={money(data.revenue)} icon={Store} /></div><section className="table-section"><div className="section-heading"><h2>Recent inventory</h2><Button href="/agency/products/add" kind="small" icon={Plus}>Add product</Button></div><ProductGrid products={data.recentProducts || []} /></section><section className="table-section"><h2>Recent orders</h2><OrdersTable orders={data.recentOrders || []} customer={false} /></section></Portal>
}

function AdminDashboard() {
  const stats = data.stats || {}
  const documents = stats.pendingDocuments || []
  return <Portal user={data.admin} admin title="Administration overview" subtitle="Monitor the marketplace and review agency submissions."><div className="stat-grid stat-grid-four"><Stat label="Agencies" value={data.agencyCount || 0} icon={Store} /><Stat label="Customers" value={data.customerCount || 0} icon={UserRound} /><Stat label="Listings" value={data.productCount || 0} icon={Package} /><Stat label="Orders" value={data.orderCount || 0} icon={ClipboardList} /></div><section className="table-section"><div className="section-heading"><h2>Pending verification documents</h2><a className="text-link" href="/admin/agencies">Manage agencies</a></div>{documents.length ? <div className="management-list">{documents.map((doc, index) => <article className="management-row" key={`${doc.agencyId}-${doc.documentType}-${index}`}><div><strong>{doc.agencyName}</strong><small>{doc.documentType}</small></div><a href={doc.documentPath} target="_blank" rel="noreferrer">View document</a><form action={`/admin/agencies/${doc.agencyId}/documents/${doc.documentType}/approve`} method="POST"><Button kind="small" type="submit">Approve</Button></form><form action={`/admin/agencies/${doc.agencyId}/documents/${doc.documentType}/reject`} method="POST"><Field name="reason" label="Rejection reason" required /><Button kind="danger" type="submit">Reject</Button></form></article>)}</div> : <Empty title="No documents pending" detail="New agency documents will appear here." />}</section><section className="table-section"><div className="section-heading"><h2>Recent agencies</h2><a className="text-link" href="/admin/agencies">View all</a></div><AgencyTable agencies={data.recentAgencies || []} /></section><section className="table-section"><h2>Recent orders</h2><OrdersTable orders={data.recentOrders || []} /></section></Portal>
}

function AgencyTable({ agencies = [] }) {
  if (!agencies.length) return <Empty title="No agencies found" />
  return <div className="table-wrap"><table><thead><tr><th>Agency</th><th>Email</th><th>Registered</th><th>Status</th><th></th></tr></thead><tbody>{agencies.map((agency) => <tr key={idOf(agency)}><td>{agency.name}</td><td>{agency.email}</td><td>{new Date(agency.createdAt).toLocaleDateString()}</td><td><span className="status-pill">{agency.status || "Pending"}</span></td><td><a href={`/admin/agencies/${idOf(agency)}`} aria-label="Review agency"><ChevronRight size={17} /></a></td></tr>)}</tbody></table></div>
}

function AdminAgencies() {
  const [filter, setFilter] = useState("all")
  const agencies = (data.agencies || []).filter((agency) => filter === "all" || agency.status === filter)
  return <Portal user={data.admin} admin title="Agencies" subtitle="Review registrations and manage verification status."><div className="filter-tabs">{["all", "pending", "approved", "rejected"].map((value) => <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{value[0].toUpperCase() + value.slice(1)}</button>)}</div><AgencyTable agencies={agencies} /></Portal>
}

function AgencyDetail() {
  const agency = data.agency
  if (!agency) return <Portal user={data.admin} admin title="Agency details"><Empty title="Agency not found" href="/admin/agencies" /></Portal>
  const types = [["businessRegistration", "Business registration"], ["taxId", "Tax ID"], ["identityProof", "Identity proof"], ["addressProof", "Address proof"]]
  return <Portal user={data.admin} admin title={agency.name} subtitle={`${agency.email} · ${agency.agencyDetails?.businessType || "Agency"}`}><div className="document-grid">{types.map(([type, label]) => { const doc = agency.documents?.[type] || {}; return <article className="document-card" key={type}><div className="document-heading"><FileCheck2 /><span className="status-pill">{doc.status || "Missing"}</span></div><h2>{label}</h2>{doc.path ? <a href={doc.path} target="_blank" rel="noreferrer">Open document</a> : <p>No document submitted.</p>}{doc.path && <div className="form-actions"><form action={`/admin/agencies/${idOf(agency)}/documents/${type}/approve`} method="POST"><Button kind="small" type="submit">Approve</Button></form><form action={`/admin/agencies/${idOf(agency)}/documents/${type}/reject`} method="POST"><Field name="reason" label="Reason" required /><Button kind="danger" type="submit">Reject</Button></form></div>}</article>})}</div><form className="form-panel status-review" action={`/admin/agencies/${idOf(agency)}/update-status`} method="POST"><h2>Agency status</h2><label className="field"><span>Decision</span><select name="status" defaultValue={agency.status || "pending"}><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select></label><Field name="statusReason" label="Review note" as="textarea" value={agency.statusReason} /><Button type="submit">Save decision</Button></form></Portal>
}

function SimpleLogin({ admin = false }) {
  return <Frame narrow><section className="simple-panel"><span className="eyebrow">{admin ? "RESTRICTED ACCESS" : "WELCOME BACK"}</span><h1>{admin ? "Administrator sign in" : "Sign in"}</h1><form className="form-stack" action={admin ? "/admin/login" : `/auth/${data.role || "customer"}/login`} method="POST"><Field name="email" label="Email address" type="email" required /><Field name="password" label="Password" type="password" required /><Button type="submit">Sign in</Button></form></section></Frame>
}

function PublicSupport({ contact = false }) {
  return <Frame narrow><div className="page-heading"><span className="eyebrow">SETU HELP DESK</span><h1>{contact ? "Contact our team" : "How can we help?"}</h1><p>Send a message and our team will get back to you.</p></div><form className="form-panel support-form" action={contact ? "/support/contact/submit" : "/support/contact"} method="POST"><h2>{contact ? "Send us a message" : "Contact support"}</h2>{contact ? <div className="form-grid"><Field name="firstName" label="First name" required /><Field name="lastName" label="Last name" required /></div> : <Field name="name" label="Name" required />}<Field name="email" label="Email address" type="email" required />{contact && <Field name="phone" label="Phone number" type="tel" />}<Field name="subject" label="Subject" required /><Field name="message" label="Message" as="textarea" required /><Button type="submit">Send message <ArrowRight size={16} /></Button></form></Frame>
}

function TextPage() {
  const pages = {
    about: ["SETU connects consumers with quality goods offered by verified agencies.", "We make sourcing details visible, keep prices fixed, and help usable products find a new home."],
    solutions: ["A direct route from authorized agencies to individual buyers.", "SETU combines agency verification, condition details, transparent fixed-price listings, and order tracking."],
    terms: ["Use SETU responsibly and provide accurate information when creating an account, listing goods, or placing an order.", "Listings and availability are managed by participating agencies. Product condition and source details are shown where provided."],
    privacy: ["SETU uses account and order information to operate the marketplace and support purchases.", "Contact support if you need assistance with your account or information."],
  }
  return <Frame narrow><section className="simple-panel text-page"><span className="eyebrow">SETU</span><h1>{data.title || "SETU"}</h1>{(pages[data.page] || []).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<Button href="/customer/browsing">Explore products</Button></section></Frame>
}

function App() {
  const page = data.page || (path.startsWith("/agency") ? "agency" : path.startsWith("/admin") ? "admin" : path.startsWith("/customer") ? path.split("/")[2] : "home")
  if (page === "home") return <Home />
  if (["customer-browsing", "browsing"].includes(page)) return <Catalog />
  if (page === "customer-product-details") return <ProductDetail />
  if (["customer-cart", "cart"].includes(page)) return <CartPage />
  if (["customer-checkout", "checkout"].includes(page)) return <Checkout />
  if (page === "customer-login" || path === "/customer/login" || page === "login" && data.role === "customer") return <Auth mode="login" />
  if (page === "agency-login" || path === "/agency/login" || page === "login" && data.role === "agency") return <Auth mode="login" role="agency" />
  if (page === "agency-register" || path === "/agency/register" || page === "register" && data.role === "agency") return <Auth mode="register" role="agency" />
  if (page === "customer-register" || path === "/customer/register" || page === "register") return <Auth mode="register" />
  if (page === "forgot-password") return <PasswordPage />
  if (page === "reset-password" || path === "/reset-password.html") return <PasswordPage reset />
  if (["customer-order-confirmation", "order-confirmation"].includes(page)) return <Frame user={data.user} narrow><section className="confirmation-panel"><span className="confirmation-icon"><Check /></span><span className="eyebrow">ORDER RECEIVED</span><h1>Thank you for your order.</h1><p>Order <strong>{data.order?.orderId || data.orderId || ""}</strong> has been placed.</p><div className="confirmation-total"><span>Order total</span><strong>{money(data.order?.total || data.order?.totalAmount)}</strong><small>{data.order?.paymentMethod || "Cash on Delivery"}</small></div><div className="intro-actions"><Button href="/customer/orders">View your orders</Button><a className="text-link" href="/customer/browsing">Continue shopping</a></div></section></Frame>
  if (page === "customer-settings" || page === "settings" && path.startsWith("/customer")) return <SettingsPage />
  if (page === "customer-support") return <SupportPage customer />
  if (page === "customer-dashboard" || page === "dashboard" && path.startsWith("/customer")) return <CustomerDashboard />
  if (["wishlist", "customer-wishlist"].includes(page)) return <Portal user={data.user} title="Wishlist" subtitle="Your saved products."><ProductGrid products={data.wishlistItems || data.wishlist || []} authenticated wishlisted /></Portal>
  if (["orders", "customer-orders"].includes(page) && path.startsWith("/customer")) return <Portal user={data.user} title="Your orders" subtitle="Review your purchases and order status."><OrdersTable orders={data.orders || []} /></Portal>
  if (["order-details", "customer-order-details"].includes(page) && path.startsWith("/customer")) return <OrderDetail />
  if (page === "dashboard" && path.startsWith("/agency")) return <AgencyDashboard />
  if (page === "products" && path === "/agency/products") return <AgencyProducts />
  if (path === "/agency/products/add") return <ProductForm />
  if (path.startsWith("/agency/products/edit/")) return <ProductForm editing />
  if (page === "orders" && path.startsWith("/agency")) return path.endsWith("/orders") ? <AgencyOrders /> : <OrderDetail />
  if (page === "verification") return <Verification />
  if (page === "settings" && path.startsWith("/agency")) return <SettingsPage />
  if (page === "support" && path.startsWith("/agency")) return <SupportPage />
  if (page === "dashboard" && path.startsWith("/admin")) return <AdminDashboard />
  if (page === "agencies" && path === "/admin/agencies") return <AdminAgencies />
  if (page === "agencies" && path.startsWith("/admin/agencies/")) return <AgencyDetail />
  if (page === "admin-login" || path === "/admin/login") return <SimpleLogin admin />
  if (page === "support" && path === "/support") return <PublicSupport />
  if (page === "contact" || path === "/support/contact") return <PublicSupport contact />
  if (["about", "solutions", "terms", "privacy"].includes(page)) return <TextPage />
  return <Frame user={data.user}><Empty title="Page unavailable" detail="This page could not be matched to an active route." href="/" action="Return to SETU" /></Frame>
}

createRoot(document.getElementById("root")).render(<React.StrictMode><App /></React.StrictMode>)