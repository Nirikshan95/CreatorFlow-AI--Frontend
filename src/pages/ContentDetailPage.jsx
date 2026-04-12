import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contentApi } from '../api/content';
import ContentDetail from '../components/ContentDetail';

export default function ContentDetailPage() {
  const { id }  = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    contentApi.getContent(id)
      .then(setContent)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="fade-in">
      {/* Back button */}
      <button
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: 20 }}
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="skeleton" style={{ height: 180, borderRadius: 'var(--radius-xl)' }} />
          <div className="skeleton" style={{ height: 50, borderRadius: 'var(--radius-md)' }} />
          <div className="skeleton" style={{ height: 300, borderRadius: 'var(--radius-lg)' }} />
        </div>
      )}

      {error && !loading && (
        <div className="error-box">
          <strong>Failed to load content:</strong> {error}
        </div>
      )}

      {!loading && !error && content && (
        <ContentDetail content={content} />
      )}
    </div>
  );
}
