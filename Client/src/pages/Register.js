import React, { useState } from 'react';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('SecretPassword123'); // Minimum 8 caractères
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('Male'); // Ajouté pour correspondre au backend
  const [goal, setGoal] = useState('Maintain');

  const handleSignup = (e) => {
    e.preventDefault();

    if (!email || !password || !fullName || !age || !weight || !height || !gender) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    // Préparation de l'objet avec les types et clés attendus par validateRegister
    const userData = {
      Full_Name: fullName,
      Age: parseInt(age) || 0,
      Weight: parseFloat(weight) || 0,
      Height: parseInt(height) || 0,
      Goal_Type: goal,
      Gender: gender, // Transmis correctement au serveur
      Email: email,
      Password: password
    };

    fetch('http://localhost:3000/api/register', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(err => { throw new Error(err.error) });
      }
      return res.json();
    })
    .then(data => {
      alert(data.message || "Compte créé avec succès !");
      localStorage.setItem("token", data.token); // Stockage du token JWT
      localStorage.setItem("userId", data.userId);
      window.location.href = "/dashboard";
    })
    .catch(err => {
      alert("Erreur lors de l'inscription : " + err.message);
    });
  };

  return (
    <form onSubmit={handleSignup} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '350px' }}>
      <h2>Créer un compte BeHealthy</h2>
      
      <input type="text" placeholder="Nom complet" onChange={(e) => setFullName(e.target.value)} />
      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} placeholder="Mot de passe" onChange={(e) => setPassword(e.target.value)} />
      
      <input type="number" placeholder="Âge" onChange={(e) => setAge(e.target.value)} />
      <input type="number" step="0.1" placeholder="Poids (kg)" onChange={(e) => setWeight(e.target.value)} />
      <input type="number" placeholder="Taille (cm)" onChange={(e) => setHeight(e.target.value)} />
      
      <label>Genre :</label>
      <select value={gender} onChange={(e) => setGender(e.target.value)}>
        <option value="Male">Homme</option>
        <option value="Female">Femme</option>
      </select>
      
      <label>Objectif :</label>
      <select value={goal} onChange={(e) => setGoal(e.target.value)}>
        <option value="Lose">Perte de poids</option>
        <option value="Maintain">Maintien</option>
        <option value="Gain">Prise de masse</option>
      </select>

      <button type="submit">S'inscrire</button>
    </form>
  );
};

export default Register;