export default function Home() {
  return (
    <main className="container">
      <div className="brand">Afya Drop</div>
      <p className="hint">A clinical decision-support assistant for medical personnel in Uganda. Ask diagnosis and treatment questions over WhatsApp — answers come strictly from the Uganda Clinical Guidelines. Pay as you go with credits.</p>
      <div className="card">
        <nav className="nav">
          <a href="/register">Register</a>
          <a href="/login">Sign in</a>
          <a href="/dashboard">Buy credits</a>
        </nav>
      </div>
    </main>
  );
}
