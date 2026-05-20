import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { ResponseFormatInterceptor } from '../src/common/interceptors/response-format.interceptor';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalInterceptors(new ResponseFormatInterceptor());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const uniqueUsername = `testuser_${Date.now()}`;
  const testPassword = 'Test1234';

  it('should register a new user', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ 
        username: uniqueUsername, 
        email: `${uniqueUsername}@example.com`, 
        password: testPassword 
      })
      .expect(201)
      .expect(res => {
        expect(res.body.code).toBe(0);
        expect(res.body.data.access_token).toBeDefined();
      });
  });

  it('should reject duplicate username', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ 
        username: uniqueUsername, 
        email: 'another@example.com', 
        password: testPassword 
      })
      .expect(409);
  });

  it('should login with valid credentials', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ username: uniqueUsername, password: testPassword })
      .expect(201)
      .expect(res => {
        expect(res.body.code).toBe(0);
        expect(res.body.data.access_token).toBeDefined();
      });
  });

  it('should reject invalid password', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ username: uniqueUsername, password: 'WrongPassword' })
      .expect(401);
  });
});
