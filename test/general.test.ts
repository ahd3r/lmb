import { handler } from '../build/index';
import { generalReq } from './utils/get-event';
import { authService } from '../build/service/auth.service';
import { Admin } from '../build/model/Admin';
import { User } from '../build/model/User';
import { DB } from '../build/utils/db';
import { Op } from 'sequelize';

jest.spyOn(authService, 'check2fa' as any).mockImplementation(() => true);

describe('Check is application workable', () => {
  let adminToken;

  afterAll(async () => {
    const db = await DB.getDb();
    await Admin.destroy({ where: { email: { [Op.ne]: 'example@example.com' } } });
    await User.destroy({ where: {} });
    await db.close();
  });

  it('Check health check endpoint', async () => {
    let res;
    await handler(
      generalReq({ method: 'GET', path: '/healthcheck' }),
      {} as any,
      (error, response) => {
        res = error || response;
      }
    );
    expect(res).toHaveProperty('statusCode', 200);
    expect(res).toHaveProperty('body');
    const body = JSON.parse(res.body);
    expect(body).toHaveProperty('data', 'lambda is working');
  });

  describe('Check user creation', () => {
    it('Correct creation', async () => {
      let res;
      await handler(
        generalReq({
          method: 'POST',
          path: '/signup',
          body: JSON.stringify({ email: 'example2@example.com', password: '12345678' })
        }),
        {} as any,
        (error, response) => {
          res = error || response;
        }
      );
      expect(res).toHaveProperty('statusCode', 201);
      expect(res).toHaveProperty('body');
      const body = JSON.parse(res.body);
      expect(body).toHaveProperty('data');
      expect(body.data).toHaveProperty('id');
      expect(body.data).toHaveProperty('email', 'example2@example.com');
      expect(body.data).toHaveProperty('password');
      expect(body.data).toHaveProperty('recoveryToken', null);
      expect(body.data).toHaveProperty('twofa', false);
      expect(body.data).toHaveProperty('createdAt');
      expect(body.data).toHaveProperty('updatedAt');
    });
    it('Duplicat creation', async () => {
      let res;
      await handler(
        generalReq({
          method: 'POST',
          path: '/signup',
          body: JSON.stringify({ email: 'example2@example.com', password: '12345678' })
        }),
        {} as any,
        (error, response) => {
          res = error || response;
        }
      );
      expect(res).toHaveProperty('statusCode', 400);
      expect(res).toHaveProperty('body');
      const data = JSON.parse(res.body);
      expect(data).toHaveProperty('error');
      expect(data.error).toHaveProperty('message', 'User with this email already exist');
      expect(data.error).toHaveProperty('status', 400);
      expect(data.error).toHaveProperty('name', 'ValidationError');
    });
    it('Data incorrect creation', async () => {
      let res;
      await handler(
        generalReq({
          method: 'POST',
          path: '/signup',
          body: JSON.stringify({ email: 'example2example.com', password: '12345678' })
        }),
        {} as any,
        (error, response) => {
          res = error || response;
        }
      );
      expect(res).toHaveProperty('statusCode', 400);
      expect(res).toHaveProperty('body');
      const data = JSON.parse(res.body);
      expect(data).toHaveProperty('error');
      expect(data.error).toHaveProperty('message', 'Body Validator Error');
      expect(data.error).toHaveProperty('status', 400);
      expect(data.error).toHaveProperty('name', 'ArrayValidationError');
      expect(data.error).toHaveProperty('errors');
      expect(data.error.errors[0].message).toBe('email must be an email');
    });
    it('Correct admin creation', async () => {
      let res;
      await handler(
        generalReq({
          method: 'POST',
          path: '/signup-admin',
          body: JSON.stringify({ email: 'example2@example.com', password: '12345678' }),
          headers: { 'secret-word': 'have-to-be-the-most-secret-word' }
        }),
        {} as any,
        (error, response) => {
          res = error || response;
        }
      );
      expect(res).toHaveProperty('statusCode', 201);
      expect(res).toHaveProperty('body');
      const body = JSON.parse(res.body);
      expect(body).toHaveProperty('data');
      expect(body.data).toHaveProperty('id');
      expect(body.data).toHaveProperty('email', 'example2@example.com');
      expect(body.data).toHaveProperty('password');
      expect(body.data).toHaveProperty('recoveryToken', null);
      expect(body.data).toHaveProperty('twofa', false);
      expect(body.data).toHaveProperty('createdAt');
      expect(body.data).toHaveProperty('updatedAt');
    });
  });

  describe('Check login', () => {
    it('Check login root admin', async () => {
      let res;
      await handler(
        generalReq({
          method: 'POST',
          path: '/login',
          body: JSON.stringify({
            email: 'example@example.com',
            password: 'adminadmin',
            type: 'admin',
            code: '123456'
          })
        }),
        {} as any,
        (error, response) => {
          res = error || response;
        }
      );
      expect(res).toHaveProperty('statusCode', 201);
      expect(res).toHaveProperty('body');
      const body = JSON.parse(res.body);
      expect(body).toHaveProperty('data');
      expect(body.data).toHaveProperty('token');
      adminToken = body.data.token;
    });

    it('Check login second admin', async () => {
      let res;
      await handler(
        generalReq({
          method: 'POST',
          path: '/login',
          body: JSON.stringify({
            email: 'example2@example.com',
            password: '12345678',
            type: 'admin',
            code: '123456'
          })
        }),
        {} as any,
        (error, response) => {
          res = error || response;
        }
      );
      expect(res).toHaveProperty('statusCode', 201);
      expect(res).toHaveProperty('body');
      const body = JSON.parse(res.body);
      expect(body).toHaveProperty('data');
      expect(body.data).toHaveProperty('token');
      adminToken = body.data.token;
    });

    // it('Check correct logout', async () => {});

    // it('Check incorrect logout', async () => {});
  });
});
