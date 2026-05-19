import React, { useState } from 'react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('SecretPassword123');

  const handleLogin = (e) => {
    e.preventDefault();

    fetch('http://localhost:3000/api/login', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Email: email, Password: password }) 
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(err => { throw new Error(err.error) });
      }
      return res.json();
    })
    .then(data => {
      alert("Connexion réussie !");
      localStorage.setItem("token", data.token); // Stockage du token
      localStorage.setItem("userId", data.userId);
      window.location.href = "/dashboard";
    })
    .catch(err => alert("Erreur : " + err.message));
  };

  return (
    <form onSubmit={handleLogin} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '350px' }}>
      <h2>Connexion</h2>
      <input 
        type="email" 
        placeholder="Email" 
        onChange={(e) => setEmail(e.target.value)} 
      />
      <input 
        type="password" 
        value={password}
        placeholder="Mot de passe" 
        onChange={(e) => setPassword(e.target.value)} 
      />
      <button type="submit">Se connecter</button>
    </form>
  );
};

export default Login;