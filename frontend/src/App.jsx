import { useEffect, useState } from "react";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import { api } from "./api";
import { Navigate } from "react-router-dom";

function Layout({ user, setUser }) {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  return (
    <header className="header">
      <Link className="brand" to="/">PageTurn</Link>
        <nav>
          <button
            className="theme-toggle"
            onClick={() => {
              document.body.classList.toggle("dark-mode");
            }}
            title="Toggle theme"
          >
            ◐
          </button>

          <Link to="/">Books</Link>

          {user && <Link to="/cart">Cart</Link>}
          {user && <Link to="/orders">Orders</Link>}
          {user?.role === "admin" && <Link to="/admin">Admin</Link>}

          {!user ? (
            <Link to="/login">Login</Link>
          ) : (
            <button onClick={logout}>Logout</button>
          )}
        </nav>
    </header>
  );
}

const gradientColors = [
  ["#ffd6e8", "#d8e7ff", "#e5d8ff"],
  ["#ffe0b2", "#ffd1dc", "#d9c2ff"],
  ["#c8f7ff", "#d9d0ff", "#ffd6f6"],
  ["#fff0b8", "#ffd0e8", "#c8e8ff"],
  ["#d5ffd9", "#c9e8ff", "#ead4ff"],
  ["#ffd6a5", "#ffcad4", "#cdb4db"],
  ["#bde0fe", "#ffc8dd", "#caffbf"],
  ["#f9c6ff", "#c6e7ff", "#fff1b8"]
];

function getBookGradient(id) {
  const colors = gradientColors[id % gradientColors.length];

  return `linear-gradient(
    135deg,
    ${colors[0]},
    ${colors[1]},
    ${colors[2]}
  )`;
}

function Books({ user }) {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sort, setSort] = useState("Featured");

  useEffect(() => {
    api.books()
      .then(setBooks)
      .catch(e => setError(e.message));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;

      document.documentElement.style.setProperty(
        "--scroll-y",
        `${y}px`
      );

      document.documentElement.style.setProperty(
        "--hero-parallax",
        `${y * 0.18}px`
      );

      document.documentElement.style.setProperty(
        "--hero-parallax-reverse",
        `${y * -0.10}px`
      );
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const add = async (id) => {
    if (!user) return alert("Login first");

    try {
      await api.addCart(id);
      alert("Added to cart");
    } catch (e) {
      alert(e.message);
    }
  };

  const filteredBooks = books
    .filter(book => {
      const text = `${book.title} ${book.author}`.toLowerCase();
      return text.includes(search.toLowerCase());
    })
    .filter(book => {
      if (activeFilter === "All") return true;
      if (activeFilter === "Under ₹500") return Number(book.price) < 500;
      if (activeFilter === "Popular") return Number(book.stock) > 10;
      if (activeFilter === "Discounts") return Number(book.discount) > 0;
      return true;
    })
    .sort((a, b) => {
      if (sort === "Price low") return Number(a.price) - Number(b.price);
      if (sort === "Price high") return Number(b.price) - Number(a.price);
      if (sort === "A-Z") return a.title.localeCompare(b.title);
      return 0;
    });

  return (
    <main className="home">

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">📚 YOUR NEXT OBSESSION</span>

          <h1>
            Books that make
            <span> you think.</span>
          </h1>

          <p>
            Discover stories, ideas and worlds worth getting lost in.
          </p>

          <div className="hero-actions">
            <a href="#catalog" className="hero-button">
              Explore books ↓
            </a>

            <span className="hero-note">
              ✦ Curated for curious minds
            </span>
          </div>
        </div>

        <div className="hero-orbit orbit-one">✦</div>
        <div className="hero-orbit orbit-two">📖</div>
        <div className="hero-orbit orbit-three">✦</div>
      </section>

      {/* CATALOG */}
      <section className="catalog" id="catalog">

        <div className="section-heading">
          <div>
            <span className="eyebrow">DISCOVER</span>
            <h2>Find your next read.</h2>
          </div>

          <span className="book-count">
            {filteredBooks.length} books
          </span>
        </div>

        {/* SEARCH + SORT */}
        <div className="catalog-controls">

          <div className="search-box">
            🔎
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search books or authors..."
            />
          </div>

          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            <option>Featured</option>
            <option>Price low</option>
            <option>Price high</option>
            <option>A-Z</option>
          </select>

        </div>

        {/* FILTER TOGGLES */}
        <div className="filter-row">
          {["All", "Popular", "Under ₹500", "Discounts"].map(filter => (
            <button
              key={filter}
              className={activeFilter === filter ? "filter active" : "filter"}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {error && <p className="error">{error}</p>}

        {/* BOOKS */}
        <div className="book-grid">

          {filteredBooks.map(book => {
            const discountedPrice =
              Number(book.price) -
              (Number(book.price) * Number(book.discount || 0)) / 100;

            return (
              <article
                className="book-card"
                onClick={() => window.location.href = `/book/${book.id}`}
              >

                <div
                  className="book-cover"
                  style={{ background: getBookGradient(book.id) }}
                >
                  {book.cover_image ? (
                      <img
                        src={book.cover_image}
                        alt={book.title}
                      />
                    ) : (
                    <div className="cover-letter">
                      {book.title?.[0]}
                    </div>
                  )}

                  <div className="cover-decoration">
                    ✦
                  </div>

                  {book.discount > 0 && (
                    <span className="discount">
                      -{book.discount}%
                    </span>
                  )}
                </div>

                <div className="book-info">
                  <span className="book-author">
                    {book.author}
                  </span>

                  <h3>{book.title}</h3>

                  <div className="book-rating">
                    ★ ★ ★ ★ ★
                    <span> 4.8</span>
                  </div>

                  <div className="book-bottom">

                    <div className="price">
                      <strong>
                        ₹{discountedPrice.toFixed(0)}
                      </strong>

                      {book.discount > 0 && (
                        <del>
                          ₹{Number(book.price).toFixed(0)}
                        </del>
                      )}
                    </div>

                    <button
                      className="add-button"
                      disabled={!book.stock}
                      onClick={(e) => {
                        e.stopPropagation();
                        add(book.id);
                      }}
                    >
                      {book.stock ? "+" : "×"}
                    </button>

                  </div>
                </div>

              </article>
            );
          })}

        </div>

        {filteredBooks.length === 0 && (
          <div className="empty-state">
            <div>📚</div>
            <h3>No books found</h3>
            <p>Try a different search or filter.</p>
          </div>
        )}

      </section>

      {/* BOTTOM DISCOVERY STRIP */}
      <section className="discovery-strip">
        <span>READ MORE</span>
        <strong>THINK DIFFERENT</strong>
        <span>STAY CURIOUS</span>
        <strong>REPEAT ↗</strong>
      </section>

    </main>
  );
}

function Login({ setUser }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async e => {
    e.preventDefault();
    try {
      const token = await api.login(email, password);
      localStorage.setItem("token", token.access_token);
      const me = await api.me();
      setUser(me);
      navigate("/");
    } catch (err) { setError(err.message); }
  };

  return (
    <main className="form-page">
      <form className="form-card" onSubmit={submit}>
        <h2>Login</h2>
        {error && <p className="error">{error}</p>}
        <input
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
        />
        <input
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
        />
        <button>Login</button>
        <p>
          New here? <Link to="/register">Create account</Link>
        </p>
      </form>
    </main>
  );
}

function Register({ setUser }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });

  const [error, setError] = useState("");

  const submit = async e => {
    e.preventDefault();

    try {
      await api.register(form);

      // Automatically log in after registration
      const token = await api.login(form.email, form.password);

      localStorage.setItem("token", token.access_token);

      const me = await api.me();
      setUser(me);

      navigate("/");
    } catch (err) {
      setError(err.message || "Registration failed");
    }
  };

  return (
    <main className="form-page">
      <form className="form-card" onSubmit={submit}>
        <h2>Create account</h2>

        {error && <p className="error">{error}</p>}

        <input
          required
          value={form.name}
          onChange={e =>
            setForm({ ...form, name: e.target.value })
          }
          placeholder="Full name"
        />

        <input
          required
          type="email"
          value={form.email}
          onChange={e =>
            setForm({ ...form, email: e.target.value })
          }
          placeholder="Email"
        />

        <input
          required
          type="tel"
          value={form.phone}
          onChange={e =>
            setForm({ ...form, phone: e.target.value })
          }
          placeholder="Phone number"
        />

        <input
          required
          type="password"
          value={form.password}
          onChange={e =>
            setForm({ ...form, password: e.target.value })
          }
          placeholder="Password"
        />

        <button type="submit">
          Create account
        </button>
      </form>
    </main>
  );
}

function Cart() {
  const [cart, setCart] = useState([]);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await api.cart();
      setCart(Array.isArray(data) ? data : data.items || []);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const total = cart.reduce(
    (sum, item) => {
      const price = Number(item.book?.price || 0);
      const discount = Number(item.book?.discount || 0);
      const finalPrice = price * (1 - discount / 100);

      return sum + finalPrice * item.quantity;
    },
    0
  );

  return (
    <main className="cart-page">
      <div className="cart-container">

        <div className="cart-heading">
          <div>
            <span className="eyebrow">YOUR PICKS</span>
            <h1>Your reading list.</h1>
            <p>Books waiting to become your next obsession.</p>
          </div>

          <span className="cart-count">
            {cart.length} {cart.length === 1 ? "book" : "books"}
          </span>
        </div>

        {error && <p className="error">{error}</p>}

        {cart.length === 0 ? (
          <div className="cart-empty">
            <div className="empty-icon">🛒</div>
            <h2>Your cart is empty.</h2>
            <p>Looks like you haven't found your next read yet.</p>
            <a href="/" className="hero-button">
              Browse books →
            </a>
          </div>
        ) : (
          <div className="cart-layout">

            <section className="cart-items">
              {cart.map(item => (
                <article className="cart-item" key={item.id}>

                  <div className="cart-cover">
                    {item.book?.cover_image ? (
                      <img
                        src={item.book.cover_image}
                        alt={item.book.title}
                      />
                    ) : (
                      <span>
                        {item.book?.title?.[0]}
                      </span>
                    )}
                  </div>

                  <div className="cart-item-info">
                    <span>BOOK</span>
                    <h3>{item.book?.title}</h3>
                    <p>{item.book?.author}</p>
                    <strong>
                      ₹{(
                        Number(item.book?.price || 0) *
                        (1 - Number(item.book?.discount || 0) / 100)
                      ).toFixed(0)}
                    </strong>
                  </div>

                  <div className="quantity-controls">
                    <button
                      onClick={async () => {
                        try {
                          if (item.quantity === 1) {
                            await api.removeCart(item.id);
                          } else {
                            await api.updateCart(
                              item.id,
                              item.quantity - 1
                            );
                          }

                          load();
                        } catch (e) {
                          setError(e.message);
                        }
                      }}
                    >
                      −
                    </button>

                    <strong>{item.quantity}</strong>

                    <button
                      onClick={async () => {
                        try {
                          await api.addCart(item.book.id, 1);
                          load();
                        } catch (e) {
                          setError(e.message);
                        }
                      }}
                    >
                      +
                    </button>
                  </div>
                </article>
              ))}
            </section>

            <aside className="cart-summary">
              <span className="eyebrow">SUMMARY</span>
              <h2>Ready to checkout?</h2>

              <div className="summary-row">
                <span>Items</span>
                <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>

              <div className="summary-row total-row">
                <span>Total</span>
                <strong>₹{total.toFixed(2)}</strong>
              </div>

              <div className="cart-actions">
                <a href="/" className="secondary-button">
                  ← Continue shopping
                </a>

                <a href="/checkout" className="hero-button">
                  Continue to checkout →
                </a>
              </div>
            </aside>

          </div>
        )}

      </div>
    </main>
  );
}

function Checkout({ user }) {
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: ""
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartError, setCartError] = useState(""); 

  useEffect(() => {
    api.cart()
      .then(data => {
        setCart(Array.isArray(data) ? data : data.items || []);
      })
      .catch(e => setCartError(e.message));
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await api.checkout({
        shipping_name: form.full_name,
        shipping_phone: form.phone,
        shipping_address: `${form.address}, ${form.city}, ${form.state} - ${form.pincode}`
      });

      setSuccess(true);

      setTimeout(() => {
        window.location.href = "/orders";
      }, 1200);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="checkout-page">
        <div className="checkout-container">
          <div className="orders-empty">
            <div>✓</div>
            <h2>Order placed.</h2>
            <p>Your books are confirmed. Taking you to your orders...</p>
          </div>
        </div>
      </main>
    );
  }
  return (
    <main className="checkout-page">
      <div className="checkout-container">

        <div className="checkout-heading">
          <span className="eyebrow">ALMOST THERE</span>
          <h1>Checkout.</h1>
          <p>Just a few details and your books are on their way.</p>
          <a href="/cart" className="secondary-button">
            ← Back to cart
          </a>
        </div>

        {cart.length === 0 ? (
          <div className="orders-empty">
            <div>🛒</div>
            <h2>Your cart is empty.</h2>
            <p>Add some books before checking out.</p>

            <a href="/" className="hero-button">
              Explore books →
            </a>
          </div>
        ) : (
        <form className="checkout-card" onSubmit={submit}>

          <div className="checkout-section">
            <h2>Delivery details</h2>

            <label>
              Full name
              <input
                required
                value={form.full_name}
                onChange={e =>
                  setForm({ ...form, full_name: e.target.value })
                }
                placeholder="Your full name"
              />
            </label>

            <label>
              Phone
              <input
                required
                value={form.phone}
                onChange={e =>
                  setForm({ ...form, phone: e.target.value })
                }
                placeholder="10-digit phone number"
              />
            </label>

            <label>
              Address
              <textarea
                required
                value={form.address}
                onChange={e =>
                  setForm({ ...form, address: e.target.value })
                }
                placeholder="House no., street, area"
              />
            </label>

            <div className="checkout-row">

              <label>
                City
                <input
                  required
                  value={form.city}
                  onChange={e =>
                    setForm({ ...form, city: e.target.value })
                  }
                  placeholder="City"
                />
              </label>

              <label>
                State
                <input
                  required
                  value={form.state}
                  onChange={e =>
                    setForm({ ...form, state: e.target.value })
                  }
                  placeholder="State"
                />
              </label>

              <label>
                PIN code
                <input
                  required
                  value={form.pincode}
                  onChange={e =>
                    setForm({ ...form, pincode: e.target.value })
                  }
                  placeholder="PIN"
                />
              </label>

            </div>
          </div>

          <div className="checkout-summary">
            <h2>Order summary</h2>

            {cartError && <p className="error">{cartError}</p>}

            {cart.map(item => {
              const price = Number(item.book?.price || 0);
              const discount = Number(item.book?.discount || 0);
              const finalPrice = price * (1 - discount / 100);

              return (
                <div className="checkout-item" key={item.id}>
                  <div>
                    <strong>{item.book?.title}</strong>
                    <span>Qty: {item.quantity}</span>
                  </div>

                  <strong>
                    ₹{(finalPrice * item.quantity).toFixed(0)}
                  </strong>
                </div>
              );
            })}

            <div className="checkout-total">
              <span>Total</span>
              <strong>
                ₹
                {cart
                  .reduce((total, item) => {
                    const price = Number(item.book?.price || 0);
                    const discount = Number(item.book?.discount || 0);
                    const finalPrice = price * (1 - discount / 100);

                    return total + finalPrice * item.quantity;
                  }, 0)
                  .toFixed(0)}
              </strong>
            </div>
          </div>

          <div className="checkout-bottom">
            <p>
              🔒 Your order will be securely placed through your account.
            </p>

            <button type="submit" disabled={loading}>
              {loading ? "Placing order..." : "Place order →"}
            </button>
          </div>

        </form>
        )}

      </div>
    </main>
  );
}

function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await api.orders();
      setOrders(data);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="orders-page">
      <div className="orders-container">

        <div className="orders-heading">
          <div>
            <span className="eyebrow">YOUR JOURNEY</span>
            <h1>Your orders.</h1>
            <p>Every book you've decided to bring home.</p>
          </div>

          <span className="orders-count">
            {orders.length} {orders.length === 1 ? "order" : "orders"}
          </span>
        </div>

        {error && <p className="error">{error}</p>}

        {orders.length === 0 ? (
          <div className="orders-empty">
            <div>📦</div>
            <h2>No orders yet.</h2>
            <p>Your future reading adventures will appear here.</p>

            <a href="/" className="hero-button">
              Explore books →
            </a>
          </div>
        ) : (
          <div className="orders-list">

            {orders.map(order => (
              <article className="order-card" key={order.id}>

                <div className="order-top">
                  <div>
                    <span className="order-label">ORDER</span>
                    <h2>#{order.id}</h2>
                    <p className="order-date">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })
                        : "Date unavailable"}
                    </p>
                  </div>

                  <span className={`order-status ${order.status?.toLowerCase()}`}>
                    {order.status}
                  </span>
                </div>

                <div className="order-divider" />
                  {order.shipping_name && (
                    <div className="shipping-info">
                      <span>DELIVERY TO</span>
                      <strong>{order.shipping_name}</strong>
                      <p>
                        {order.shipping_phone}
                        <br />
                        {order.shipping_address}
                      </p>
                    </div>
                  )}
                <div className="order-details">

                  <div>
                    <span>ITEMS</span>
                    <strong>
                      {order.items?.length || 0} books
                    </strong>
                  </div>

                  <div>
                    <span>PAYMENT</span>
                    <strong>
                      {order.payment_status}
                    </strong>
                  </div>

                  <div>
                    <span>TOTAL</span>
                    <strong>
                      ₹{Number(order.total).toFixed(2)}
                    </strong>
                  </div>

                </div>

                {["pending", "confirmed"].includes(order.status?.toLowerCase()) && (
                  <button
                    className="cancel-order"
                    onClick={async () => {
                      if (!window.confirm("Cancel this order?")) return;

                      try {
                        await api.cancelOrder(order.id);
                        alert("Order cancelled");
                        load();
                      } catch (e) {
                        alert(e.message);
                      }
                    }}
                  >
                    Cancel order
                  </button>
                )}

                {order.items?.length > 0 && (
                  <div className="ordered-books">
                    {order.items.map((item, index) => (
                      <div className="ordered-book" key={item.id || index}>
                        <div className="mini-cover">
                          {item.title?.[0]}
                        </div>

                        <div>
                          <strong>{item.title}</strong>
                          <p>
                            Quantity: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </article>
            ))}

          </div>
        )}

      </div>
    </main>
  );
}

function AdminRoute({ user }) {
  if (!user) {
    return <p className="error">Please login first.</p>;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Admin />;
}

function BookDetail() {
  const [book, setBook] = useState(null);
  const [error, setError] = useState("");

  const id = window.location.pathname.split("/").pop();

  useEffect(() => {
    api.books()
      .then(books => {
        const found = books.find(b => String(b.id) === String(id));

        if (!found) {
          setError("Book not found");
        } else {
          setBook(found);
        }
      })
      .catch(e => setError(e.message));
  }, [id]);

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!book) {
    return <p>Loading book...</p>;
  }

  return (
    <main className="book-detail-page">
      <div className="book-detail">

        <div
          className="book-detail-cover"
          style={{ background: getBookGradient(book.id) }}
        >
          {book.cover_image ? (
            <img
              src={book.cover_image}
              alt={book.title}
            />
          ) : (
            <div className="cover-letter">
              {book.title?.[0]}
            </div>
          )}

          <div className="cover-decoration">
            ✦
          </div>
        </div>

        <div className="book-detail-info">
          <span className="eyebrow">BOOK DETAILS</span>

          <h1>{book.title}</h1>

          <p className="book-author">
            by {book.author}
          </p>

          <strong className="book-detail-price">
            ₹{(Number(book.price) * (1 - Number(book.discount || 0) / 100)).toFixed(0)}
          </strong>

          {book.discount > 0 && (
            <span className="discount">
              -{book.discount}%
            </span>
          )}

          <p className="book-description">
            {book.description}
          </p>

          <p>ISBN: {book.isbn}</p>

          <button
            className="hero-button"
            onClick={async (e) => {
              e.stopPropagation();

              try {
                await api.addCart(book.id, 1);
                alert("Added to cart");
              } catch (e) {
                alert(e.message);
              }
            }}
          >
            Add to cart →
          </button>
        </div>

      </div>
    </main>
  );
}

function Admin() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({
    title:"", author:"", isbn:"", price:"", stock:0, discount:0, description:""
  });

  const [editingId, setEditingId] = useState(null);
  const load = async () => {
    
    try {
      const data = await api.books();
      setBooks(data);
    } catch (e) {
      alert(e.message);
    }
  };

  const editBook = (book) => {
    setEditingId(book.id);
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      price: book.price,
      stock: book.stock,
      discount: book.discount,
      description: book.description || "",
      cover_image: book.cover_image || ""
    });
  };

  useEffect(() => {
    load();
  }, []);

  const create = async e => {
    e.preventDefault();

    try {
      const data = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        discount: Number(form.discount)
      };

      if (editingId) {
        await api.updateBook(editingId, data);
        alert("Book updated");
      } else {
        await api.createBook(data);
        alert("Book added");
      }

      setEditingId(null);
      setForm({
        title: "",
        author: "",
        isbn: "",
        price: "",
        stock: 0,
        discount: 0,
        description: "",
        cover_image: ""
      });

      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <main className="container">
      <h1>Admin</h1>
      <form className="form-card" onSubmit={create}>

        <label>
          Book title
          <input
            required
            placeholder="Book title"
            value={form.title}
            onChange={e => setForm({...form, title: e.target.value})}
          />
        </label>

        <label>
          Author
          <input
            required
            placeholder="Author name"
            value={form.author}
            onChange={e => setForm({...form, author: e.target.value})}
          />
        </label>

        <label>
          ISBN
          <input
            required
            placeholder="ISBN"
            value={form.isbn}
            onChange={e => setForm({...form, isbn: e.target.value})}
          />
        </label>

        <label>
          Cover image URL
          <input
            type="url"
            placeholder="https://example.com/book-cover.jpg"
            value={form.cover_image}
            onChange={e =>
              setForm({...form, cover_image: e.target.value})
            }
          />
        </label>

        <label>
          Price (₹)
          <input
            required
            type="number"
            placeholder="e.g. 599"
            value={form.price}
            onChange={e => setForm({...form, price: e.target.value})}
          />
        </label>

        <label>
          Stock quantity
          <input
            required
            type="number"
            placeholder="e.g. 20"
            value={form.stock}
            onChange={e => setForm({...form, stock: e.target.value})}
          />
        </label>

        <label>
          Discount (%)
          <input
            type="number"
            placeholder="e.g. 10"
            value={form.discount}
            onChange={e => setForm({...form, discount: e.target.value})}
          />
        </label>

        <label>
          Description
          <textarea
            placeholder="Book description"
            value={form.description}
            onChange={e => setForm({...form, description: e.target.value})}
          />
        </label>

        <button type="submit">
          {editingId ? "Update book" : "Add book"}
        </button>

      </form>
      <div className="grid">
        {books.map(b => (
        <article className="card" key={b.id}>
          <h3>{b.title}</h3>
          <p>{b.author}</p>

          <span className={`stock-badge ${b.stock === 0 ? "out" : b.stock <= 5 ? "low" : ""}`}>
            {b.stock === 0
              ? "Out of stock"
              : b.stock <= 5
                ? `Only ${b.stock} left`
                : `${b.stock} in stock`}
          </span>

          <p>
            ₹{Number(b.price).toFixed(0)}
            {Number(b.discount) > 0 && ` • ${b.discount}% off`}
          </p>

          <button onClick={() => editBook(b)}>
            Edit
          </button>

          <button onClick={() => api.deleteBook(b.id).then(load).catch(e => alert(e.message))}>
            Delete
          </button>
        </article>
      ))}
      </div>
    </main>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("token")) api.me().then(setUser).catch(() => localStorage.removeItem("token"));
  }, []);

  return (
    <>
      <Layout user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<Books user={user} />} />
        <Route path="/book/:id" element={<BookDetail />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register setUser={setUser} />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/admin" element={<AdminRoute user={user} />} />
        <Route path="/checkout" element={
            user
              ? <Checkout user={user} />
              : <p className="error">Please login first.</p>
          }
        />
      </Routes>
    </>
  );
}
