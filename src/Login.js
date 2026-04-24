import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setStatus("Conectando...");

    try {
      const res = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Credenciales inválidas");
      }

      localStorage.setItem("token", data.accessToken);
      setStatus("Login exitoso. Redirigiendo...");
      navigate("/dashboard");
    } catch (error) {
      setStatus(error.message);
      console.error("ERROR:", error);
    }
  };

  return (
    <div className="page login-page">
      <div className="card login-card">
        <h1>Iniciar sesión</h1>
        <div className="field">
          <label>Usuario</label>
          <input
            className="input"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="admin"
          />
        </div>
        <div className="field">
          <label>Contraseña</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="1234"
          />
        </div>
        <button className="button primary" onClick={handleLogin}>
          Entrar
        </button>
        {status && <p className="status">{status}</p>}
      </div>
    </div>
  );
}

export default Login;