import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { ResponseFormatInterceptor } from '../src/common/interceptors/response-format.interceptor';

describe('Data Isolation (e2e)', () => {
  let app: INestApplication;
  let userAToken: string;
  let userBToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalInterceptors(new ResponseFormatInterceptor());
    await app.init();

    // Register two users
    const resA = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ 
        username: `usera_${Date.now()}`, 
        email: `usera_${Date.now()}@example.com`, 
        password: 'Test1234' 
      });
    userAToken = resA.body.data.access_token;

    const resB = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ 
        username: `userb_${Date.now()}`, 
        email: `userb_${Date.now()}@example.com`, 
        password: 'Test1234' 
      });
    userBToken = resB.body.data.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should not allow user A to access user B documents', async () => {
    // User A creates document
    const doc = await request(app.getHttpServer())
      .post('/api/v1/documents')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ title: 'UserA Doc', content: 'Content' });

    // User B tries to access User A's document
    return request(app.getHttpServer())
      .get(`/api/v1/documents/${doc.body.data.id}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .expect(404);
  });

  it('should not allow user A to access user B tags', async () => {
    // User B creates tag
    const tag = await request(app.getHttpServer())
      .post('/api/v1/tags')
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ name: `UserBTag_${Date.now()}` });

    // User A tries to access User B's tag
    return request(app.getHttpServer())
      .get(`/api/v1/tags/${tag.body.data.id}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .expect(404);
  });
});
