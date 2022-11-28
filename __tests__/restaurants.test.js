const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService');

// Dummy user for testing
const mockUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: '12345',
};

const registerAndLogin = async (userProps = {}) => {
  const password = userProps.password ?? mockUser.password;

  // Create an "agent" that gives us the ability
  // to store cookies between requests in a test
  const agent = request.agent(app);

  // Create a user to sign in with
  const user = await UserService.create({ ...mockUser, ...userProps });

  // ...then sign in
  const { email } = user;
  await agent.post('/api/v1/users/sessions').send({ email, password });
  return [agent, user];
};

describe('restaurant routes', () => {
  beforeEach(() => {
    return setup(pool);
  });
  it('/restaurants should return a list of restaurants', async () => {
    const resp = await request(app).get('/api/v1/restaurants');
    expect(resp.status).toEqual(200);
    expect(resp.body).toMatchInlineSnapshot(`
      Array [
        Object {
          "id": "1",
          "name": "Pip's Original",
        },
        Object {
          "id": "2",
          "name": "Mucca Osteria",
        },
        Object {
          "id": "3",
          "name": "Mediterranean Exploration Company",
        },
        Object {
          "id": "4",
          "name": "Salt & Straw",
        },
      ]
    `);
  });

  it('GET /api/v1/restaurants/:id should return a restaurant with nested reviews', async () => {
    const resp = await request(app).get('/api/v1/restaurants/1');
    expect(resp.status).toBe(200);
    expect(resp.body).toMatchInlineSnapshot(`
      Object {
        "cost": 1,
        "id": "1",
        "image": "https://media-cdn.tripadvisor.com/media/photo-o/05/dd/53/67/an-assortment-of-donuts.jpg",
        "name": "Pip's Original",
        "reviews": Array [
          Object {
            "detail": "Best restaurant ever!",
            "id": "1",
            "restaurantId": "1",
            "stars": 5,
            "userId": "1",
          },
          Object {
            "detail": "Terrible service :(",
            "id": "2",
            "restaurantId": "1",
            "stars": 1,
            "userId": "2",
          },
          Object {
            "detail": "It was fine.",
            "id": "3",
            "restaurantId": "1",
            "stars": 4,
            "userId": "3",
          },
        ],
      }
    `);
  });
  afterAll(() => {
    pool.end();
  });
});
