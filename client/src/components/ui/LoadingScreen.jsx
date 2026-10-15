export default function LoadingScreen({ label = "Loading Moonlit Foundation\u2026" }) {
  return <div className="moonlit-loader" role="status" aria-live="polite" aria-label={label}>
      <div className="moonlit-loader__glow" aria-hidden="true" />
      <div className="moonlit-loader__content">
        <img src="/moonlit-loader.gif" alt="" width="150" height="150" aria-hidden="true" />
        <div className="moonlit-loader__line" aria-hidden="true"><span /></div>
        <p>{label}</p>
      </div>
    </div>;
}
