const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const { userOneId, userOne, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should sign up a new user', async () => {
  const response = await request(app)
    .post('/users')
    .send({
      name: 'Andrew',
      email: 'andrew@example.com',
      password: 'MyPass777!',
    })
    .expect(201);

  // Assert that the db was changed correctly
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  // Assertions about the response
  expect(response.body).toMatchObject({
    user: {
      name: 'Andrew',
      email: 'andrew@example.com',
    },
    token: user.tokens[0].token,
  });

  expect(user.password).not.toBe('MyPass777?');
});

test('Should log in existing user', async () => {
  const response = await request(app)
    .post('/users/login')
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);

  const user = await User.findById(userOneId);
  const token = response.body.token;
  expect(token).toBe(user.tokens[1].token);
});

test('Should not login nonexisting user', async () => {
  await request(app)
    .post('/users/login')
    .send({
      email: 'first@last.com',
      password: 'heslo123!',
    })
    .expect(400);
});

test('Should get profile for user', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test('Should not get profile for unauthenticated user', async () => {
  await request(app).get('/users/me').send().expect(401);
});

test('Should delete account for user', async () => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user).toBeNull;
});

test('Should not delete account for unauthenticated user', async () => {
  await request(app).delete('/users/me').send().expect(401);
});

test('Should upload avatar img', async () => {
  await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should update valid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: 'Test',
    })
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.name).toBe('Test');
});

test('Should not update invalid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      location: 'Sandvika',
    })
    .expect(400);
});

test('Should not sign up user with invalid name', async () => {
  const response = await request(app).post('/users').send({
    name: 30,
    email: 'test@gmail.com',
    password: 'heslo123',
  });

  const user = await User.findById(response.body.user._id);
  expect(user.name).toEqual('30');
});

test('Should not sign up user with invalid email', async () => {
  await request(app)
    .post('/users')
    .send({
      name: 'Name',
      email: 30,
      password: 'heslo123',
    })
    .expect(400);
});

test('Should not sign up user with invalid password', async () => {
  await request(app)
    .post('/users')
    .send({
      name: 'Name',
      email: 'test@test.com',
      password: 'password123',
    })
    .expect(400);
});

test('Should not update user if unauthenticated', async () => {
  await request(app)
    .patch('/users/me')
    .send({
      name: 'Whatever Name',
    })
    .expect(401);
});

test('Should not update user with invalid email', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      email: '@gmail.com',
    })
    .expect(400);
});

test('Should not delete user if unauthenticated', async () => {
  await request(app)
    .delete('/users/me')
    .send()
    .expect(401)
})

