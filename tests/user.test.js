const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');

const userOne = {
  name: 'John Doe',
  email: 'john@doe.com',
  password: '56what!!',
};

beforeEach(async () => {
  await User.deleteMany();
  await new User(userOne).save();
});

test('Should sign up a new user', async () => {
  await request(app)
    .post('/users')
    .send({
      name: 'Andrew',
      email: 'andrew@example.com',
      password: 'MyPass777!',
    })
    .expect(201);
});

test('Should log in existing user', async () => {
  await request(app)
    .post('/users/login')
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);
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
