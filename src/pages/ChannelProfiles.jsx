import { useEffect, useMemo, useState } from 'react';
import { contentApi } from '../api/content';

function toMultiline(value) {
  if (!Array.isArray(value)) return '';
  return value.join('\n');
}

function parseLines(text) {
  return (text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseHashtags(text) {
  return (text || '')
    .split(/[\n,\s]+/)
    .map((value) => value.trim())
    .filter(Boolean);
}

function toReusableText(items) {
  if (!Array.isArray(items)) return '';
  return items
    .filter((item) => item && item.key && item.value)
    .map((item) => `${item.key}: ${item.value}`)
    .join('\n');
}

function parseReusableText(text) {
  return (text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf(':');
      if (idx < 0) return null;
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      if (!key || !value) return null;
      return { key, value };
    })
    .filter(Boolean);
}

function toForm(profile) {
  return {
    channel_name: profile?.channel_name || '',
    channel_link: profile?.channel_link || '',
    script_intro_line: profile?.script_intro_line || '',
    intro_line: profile?.intro_line || '',
    description_footer: profile?.description_footer || '',
    brand_notes: profile?.brand_notes || '',
    social_links_text: toMultiline(profile?.social_links),
    useful_links_text: toReusableText(profile?.useful_links),
    default_hashtags_text: toMultiline(profile?.default_hashtags),
    reusable_items_text: toReusableText(profile?.reusable_items),
  };
}

export default function ChannelProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [form, setForm] = useState(toForm(null));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const selectedProfile = useMemo(
    () => profiles.find((p) => p.id === selectedId) || null,
    [profiles, selectedId]
  );

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await contentApi.getChannelProfiles();
        if (!mounted) return;
        const normalized = Array.isArray(data) ? data : [];
        setProfiles(normalized);
        if (normalized.length > 0) {
          setSelectedId(normalized[0].id);
          setForm(toForm(normalized[0]));
        }
      } catch (err) {
        if (!mounted) return;
        setError('Failed to load channel profiles.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  function updateForm(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function selectProfile(id) {
    const profile = profiles.find((p) => p.id === id) || null;
    setSelectedId(id);
    setForm(toForm(profile));
    setMessage('');
    setError('');
  }

  async function handleCreateNew() {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const existingNames = profiles.map(p => p.channel_name || '').filter(Boolean);
      let newName = 'New Channel Profile';
      let counter = 1;
      while (existingNames.includes(newName)) {
        newName = `New Channel Profile ${counter}`;
        counter++;
      }
      const created = await contentApi.createChannelProfile({ channel_name: newName });
      const next = [created, ...profiles];
      setProfiles(next);
      setSelectedId(created.id);
      setForm(toForm(created));
      setMessage('New channel profile created.');
    } catch (err) {
      setError(err.message || 'Failed to create profile.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!selectedId) return;

    setSaving(true);
    setMessage('');
    setError('');

    const payload = {
      channel_name: form.channel_name,
      channel_link: form.channel_link,
      script_intro_line: form.script_intro_line,
      intro_line: form.intro_line,
      description_footer: form.description_footer,
      brand_notes: form.brand_notes,
      social_links: parseLines(form.social_links_text),
      useful_links: parseReusableText(form.useful_links_text),
      default_hashtags: parseHashtags(form.default_hashtags_text),
      reusable_items: parseReusableText(form.reusable_items_text),
    };

    try {
      const updated = await contentApi.updateChannelProfileById(selectedId, payload);
      const next = profiles.map((p) => (p.id === updated.id ? updated : p));
      setProfiles(next);
      setForm(toForm(updated));
      setMessage('Channel profile saved.');
    } catch (err) {
      setError(err.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedId) return;
    
    const selectedProfile = profiles.find(p => p.id === selectedId);
    const profileName = selectedProfile?.channel_name || 'Untitled Channel Profile';
    
    if (!window.confirm(`Are you sure you want to delete "${profileName}"? This action cannot be undone.`)) {
      return;
    }
    
    setSaving(true);
    setMessage('');
    setError('');

    try {
      await contentApi.deleteChannelProfile(selectedId);
      const next = profiles.filter((p) => p.id !== selectedId);
      setProfiles(next);
      if (next.length > 0) {
        setSelectedId(next[0].id);
        setForm(toForm(next[0]));
      } else {
        setSelectedId('');
        setForm(toForm(null));
      }
      setMessage('Channel profile deleted.');
    } catch (err) {
      setError(err.message || 'Failed to delete profile.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="card">Loading channel profiles...</div>;
  }

  return (
    <div className="fade-in" style={{ maxWidth: 980, margin: '0 auto' }}>
      <div style={{ marginBottom: 18 }}>
        <h1 className="page-title">Channel Profiles</h1>
        <p className="page-subtitle">Create and save channel-specific details, then pick one optionally while generating content.</p>
        <div style={{ marginTop: 8, padding: 10, backgroundColor: '#f0f7ff', borderRadius: 4, fontSize: '0.9em', color: '#333' }}>
          <strong>Note:</strong> All fields are optional. You can leave any field empty and it won't affect saving or generating content. However, providing more details will help generate more personalized content.
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" type="button" onClick={handleCreateNew} disabled={saving}>
            {saving ? 'Creating...' : 'New Profile'}
          </button>
          <select
            className="form-control"
            style={{ minWidth: 280, maxWidth: 480 }}
            value={selectedId}
            onChange={(e) => selectProfile(e.target.value)}
          >
            {profiles.length === 0 && <option value="">No profiles</option>}
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>{profile.channel_name || 'Untitled Channel Profile'}</option>
            ))}
          </select>
          <button className="btn btn-danger btn-sm" type="button" onClick={handleDelete} disabled={!selectedId || saving}>
            Delete
          </button>
        </div>
        {message && <div style={{ marginTop: 8, color: 'var(--success-color)' }}>{message}</div>}
        {error && <div style={{ marginTop: 8, color: 'var(--error-color)' }}>{error}</div>}
      </div>

      {selectedProfile ? (
        <form className="card" onSubmit={handleSave}>
          <div className="generate-grid">
            <div className="form-group">
              <label className="form-label">Channel Name <span style={{ color: '#888', fontSize: '0.9em' }}>(optional)</span></label>
              <input className="form-control" value={form.channel_name} onChange={(e) => updateForm('channel_name', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Channel Link <span style={{ color: '#888', fontSize: '0.9em' }}>(optional)</span></label>
              <input className="form-control" value={form.channel_link} onChange={(e) => updateForm('channel_link', e.target.value)} placeholder="https://youtube.com/@yourchannel" />
            </div>

            <div className="form-group">
              <label className="form-label">Script Intro Line <span style={{ color: '#888', fontSize: '0.9em' }}>(optional)</span></label>
              <input className="form-control" value={form.script_intro_line} onChange={(e) => updateForm('script_intro_line', e.target.value)} placeholder="Welcome back to [Channel Name]..." />
            </div>

            <div className="form-group">
              <label className="form-label">Description Intro Line <span style={{ color: '#888', fontSize: '0.9em' }}>(optional)</span></label>
              <input className="form-control" value={form.intro_line} onChange={(e) => updateForm('intro_line', e.target.value)} />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 10 }}>
            <label className="form-label">Brand Notes <span style={{ color: '#888', fontSize: '0.9em' }}>(optional)</span></label>
            <textarea className="form-control" rows={3} value={form.brand_notes} onChange={(e) => updateForm('brand_notes', e.target.value)} />
          </div>

          <div className="generate-grid" style={{ marginTop: 10 }}>
            <div className="form-group">
              <label className="form-label">Social Links (one per line) <span style={{ color: '#888', fontSize: '0.9em' }}>(optional)</span></label>
              <textarea className="form-control" rows={4} value={form.social_links_text} onChange={(e) => updateForm('social_links_text', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Useful Links (one per line: Key: Value) <span style={{ color: '#888', fontSize: '0.9em' }}>(optional)</span></label>
              <textarea className="form-control" rows={4} value={form.useful_links_text} onChange={(e) => updateForm('useful_links_text', e.target.value)} placeholder="Website: https://example.com" />
            </div>

            <div className="form-group">
              <label className="form-label">Default Hashtags (comma/space/newline) <span style={{ color: '#888', fontSize: '0.9em' }}>(optional)</span></label>
              <textarea className="form-control" rows={4} value={form.default_hashtags_text} onChange={(e) => updateForm('default_hashtags_text', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Reusable Text/Links (one per line: Key: Value) <span style={{ color: '#888', fontSize: '0.9em' }}>(optional)</span></label>
              <textarea className="form-control" rows={4} value={form.reusable_items_text} onChange={(e) => updateForm('reusable_items_text', e.target.value)} />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 10 }}>
            <label className="form-label">Description Footer <span style={{ color: '#888', fontSize: '0.9em' }}>(optional)</span></label>
            <textarea className="form-control" rows={2} value={form.description_footer} onChange={(e) => updateForm('description_footer', e.target.value)} />
          </div>

          <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</button>

        </form>
      ) : (
        <div className="card">No profile selected. Create a new profile to begin.</div>
      )}
    </div>
  );
}
