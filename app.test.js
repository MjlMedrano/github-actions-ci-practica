const request = require('supertest');
const app = require('./app');

describe('API CRUD de usuarios', () => {
  test('GET /health debe retornar status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('GET /users debe retornar la lista de usuarios', async () => {
    const res = await request(app).get('/users');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });

  test('GET /users/:id debe retornar un usuario existente', async () => {
    const res = await request(app).get('/users/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Alice');
  });

  test('GET /users/:id debe retornar 404 si no existe', async () => {
    const res = await request(app).get('/users/999');
    expect(res.statusCode).toBe(404);
  });

  test('POST /users debe crear un usuario', async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 'Carlos', email: 'carlos@example.com' });
    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBe(3);
    expect(res.body.name).toBe('Carlos');
  });

  test('POST /users debe retornar 400 si faltan datos', async () => {
    const res = await request(app).post('/users').send({ name: 'Sin email' });
    expect(res.statusCode).toBe(400);
  });

  test('PUT /users/:id debe actualizar un usuario', async () => {
    const res = await request(app)
      .put('/users/1')
      .send({ name: 'Alice Actualizada', email: 'alice2@example.com' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Alice Actualizada');
  });

  test('PUT /users/:id debe retornar 400 si faltan datos', async () => {
    const res = await request(app).put('/users/1').send({ name: 'Solo nombre' });
    expect(res.statusCode).toBe(400);
  });

  test('PUT /users/:id debe retornar 404 si no existe', async () => {
    const res = await request(app)
      .put('/users/999')
      .send({ name: 'X', email: 'x@example.com' });
    expect(res.statusCode).toBe(404);
  });

  test('DELETE /users/:id debe eliminar un usuario', async () => {
    const res = await request(app).delete('/users/2');
    expect(res.statusCode).toBe(204);
    const check = await request(app).get('/users/2');
    expect(check.statusCode).toBe(404);
  });

  test('DELETE /users/:id debe retornar 404 si no existe', async () => {
    const res = await request(app).delete('/users/999');
    expect(res.statusCode).toBe(404);
  });
});