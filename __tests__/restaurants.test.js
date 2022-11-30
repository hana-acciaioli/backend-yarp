const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService');

// Dummy user for testing
const mockUser = {
  firstName: 'Test',
  lastName: 'Testy',
  email: 'test@example.com',
  password: '12345',
};
const registerAndLogin = async () => {
  const agent = request.agent(app);
  const user = await UserService.create(mockUser);
  await agent
    .post('/api/v1/users/sessions')
    .send({ email: mockUser.email, password: mockUser.password });
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
        "cuisine": "American",
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
  it('POST /api/v1/restaurants/:id/reviews should create a new review when logged in', async () => {
    const [agent] = await registerAndLogin();
    const resp = await agent
      .post('/api/v1/restaurants/1/reviews')
      .send({ stars: '5', detail: 'New review' });
    expect(resp.status).toBe(200);
    expect(resp.body).toMatchInlineSnapshot(`
      Object {
        "detail": "New review",
        "id": "4",
        "restaurantId": "1",
        "stars": 5,
        "userId": "4",
      }
    `);
  });
  it('POST /api/v1/restaurants/:id/reviews should NOT create a new review when NOT logged in', async () => {
    const agent = await request.agent(app);
    const resp = await agent
      .post('/api/v1/restaurants/1/reviews')
      .send({ stars: '5', detail: 'New review' });
    expect(resp.status).toBe(401);
  });
  it('DELETE /api/v1/reviews/:id should delete the review if request is made by reviewer or admin', async () => {
    const [agent] = await registerAndLogin();
    await agent
      .post('/api/v1/restaurants/1/reviews')
      .send({ stars: '5', detail: 'New review' });
    const resp = await agent.delete('/api/v1/reviews/4');
    expect(resp.status).toBe(200);
    const reviewResp = await agent.get('/api/v1/reviews/4');
    expect(reviewResp.status).toBe(404);
  });
  it('GET /api/v1/reviews/:id should return a specific review', async () => {
    const [agent] = await registerAndLogin();
    await agent
      .post('/api/v1/restaurants/1/reviews')
      .send({ stars: '5', detail: 'New review' });
    const resp = await request(app).get('/api/v1/reviews/4');
    expect(resp.body).toMatchInlineSnapshot(`
      Object {
        "detail": "New review",
        "id": "4",
        "restaurantId": "1",
        "stars": 5,
        "userId": "4",
      }
    `);
  });
  it('DELETE /api/v1/reviews/:id should delete the review if request is made by admin', async () => {
    const agent = request.agent(app);
    await UserService.create({
      firstName: 'Admin',
      lastName: 'Admin',
      email: 'admin',
      password: 'admin12345',
    });
    await agent
      .post('/api/v1/users/sessions')
      .send({ email: 'admin', password: 'admin12345' });
    const resp = await agent.delete('/api/v1/reviews/1');
    expect(resp.status).toBe(200);
    const reviewResp = await agent.get('/api/v1/reviews/1');
    expect(reviewResp.status).toBe(404);
  });
  it('DELETE /api/v1/reviews/:id should not delete a review of user is not authorized', async () => {
    const [agent] = await registerAndLogin();
    await agent
      .post('/api/v1/restaurants/1/reviews')
      .send({ stars: '5', detail: 'New review' });
    const resp = await agent.delete('/api/v1/reviews/1');
    expect(resp.status).toBe(403);
  });
  afterAll(() => {
    pool.end();
  });
});
