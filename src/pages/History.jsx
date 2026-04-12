import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { contentApi } from '../api/content';
import ContentCard from '../components/ContentCard';

const CATEGORIES = ['all', 'confidence', 'communication', 'interview', 'general'];
const PAGE_SIZE = 10;

export default function History() {
  const navigate  = useNavigate();
  const [history,  setHistory]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [search,   setSearch]   = useState('');
  const [catFilter,setCatFilter]= useState('all');
  const [page,     setPage]     = useState(1);

  useEffect(() => {
    contentApi.getHistory()
      .then(setHistory)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = history.filter((item) => {
    const matchSearch =
      !search ||
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.topic?.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'all' || item.category === catFilter;
    return matchSearch && matchCat;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSearch(e) {
    setSearch(e.target.value);
    setPage(1);
  }

  function handleCat(cat) {
    setCatFilter(cat);
    setPage(1);
  }

  return (
    <div className="fade-in">
      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Content <span className="gradient-text">History</span></h1>
        <p className="page-subtitle">
          {loading ? 'Loading…' : `${history.length} content pieces generated so far.`}
        </p>
      </div>

      {/* Controls */}
      <div className="history-controls">
        <input
          type="text"
          className="form-control search-input"
          placeholder="🔍  Search by title or topic…"
          value={search}
          onChange={handleSearch}
          disabled={loading}
        />

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`btn btn-sm ${catFilter === cat ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => handleCat(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && <div className="error-box mb-4">{error}</div>}

      {/* Loading skeletons */}
      {loading && (
        <div className="history-grid">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton" style={{ height: 140, borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && paginated.length === 0 && (
        <div className="empty-state card">
          <div className="empty-state-icon">📭</div>
          <p>
            {search || catFilter !== 'all'
              ? 'No content matches your filters.'
              : 'No content generated yet. Start by generating your first piece!'}
          </p>
          {!search && catFilter === 'all' && (
            <button className="btn btn-primary" onClick={() => navigate('/generate')}>
              Generate Now
            </button>
          )}
        </div>
      )}

      {/* Content list */}
      {!loading && paginated.length > 0 && (
        <>
          <div className="history-grid">
            {paginated.map((item) => (
              <ContentCard key={item.video_id} item={item} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button className="page-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`page-btn ${p === page ? 'active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button className="page-btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
