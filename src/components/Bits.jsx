export function EmptyState({ emoji = '🩺', title, subtitle, action }) {
  return (
    <div className="empty-state">
      <div className="emoji" aria-hidden="true">{emoji}</div>
      <h3>{title}</h3>
      {subtitle && <p>{subtitle}</p>}
      {action}
    </div>
  );
}

export function Disclaimer({ children }) {
  return <div className="disclaimer" role="note">{children}</div>;
}

export function LoadingBlock({ label }) {
  return (
    <div className="center-column" role="status" aria-live="polite">
      <div className="spinner" />
      {label && <p>{label}</p>}
    </div>
  );
}

export function ErrorBlock({ message, onRetry, retryLabel = 'Try again' }) {
  return (
    <div className="empty-state" role="alert">
      <div className="emoji" aria-hidden="true">⚠️</div>
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-secondary" style={{ width: 'auto', padding: '10px 20px' }} onClick={onRetry}>
          {retryLabel}
        </button>
      )}
    </div>
  );
}

export function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="toast" role="status" aria-live="polite">
      {message}
    </div>
  );
}
