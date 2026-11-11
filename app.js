const express = require('express');
const app = express();
app.use(express.json());

let users = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' }
];
let nextId = 3;


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Listar todos los usuarios
app.get('/users', (req, res) => {
  res.status(200).json(users);
});

// Obtener un usuario por id
app.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id === Number(req.params.id));
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }
  res.status(200).json(user);
});

// Crear un usuario
app.post('/users', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'name y email son obligatorios' });
  }
  const newUser = { id: nextId++, name, email };
  users.push(newUser);
  res.status(201).json(newUser);
});

// Actualizar un usuario
app.put('/users/:id', (req, res) => {
  const user = users.find(u => u.id === Number(req.params.id));
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'name y email son obligatorios' });
  }
  user.name = name;
  user.email = email;
  res.status(200).json(user);
});

// Eliminar un usuario
app.delete('/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }
  users.splice(index, 1);
  res.status(204).send();
});

module.exports = app;