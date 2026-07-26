// API Docs page — embeds the Swagger UI via iframe redirect
export default function ApiDocsPage() {
  return (
    <div style={{ padding: '24px 28px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>📖 API Documentation</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Swagger / OpenAPI 3.1 · All 40+ endpoints documented
        </p>
      </div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>
          The interactive API explorer is hosted directly on the backend server. Open it in a new tab:
        </p>
        <a href="http://localhost:5000/api-docs" target="_blank" rel="noreferrer" id="open-swagger-btn"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, background: 'var(--accent)', color: '#000', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
          Open Swagger UI ↗
        </a>
        <div style={{ marginTop: 24, padding: 16, borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
          <div style={{ marginBottom: 4 }}>Base URL: <span style={{ color: 'var(--accent)' }}>http://localhost:5000/api/v1</span></div>
          <div>Auth: Bearer token (JWT) — login at <span style={{ color: 'var(--blue)' }}>/auth/login</span> first</div>
        </div>
      </div>
    </div>
  );
}
