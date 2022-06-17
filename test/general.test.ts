import { handler } from '../build/index';
import { generalReq } from './utils/get-event';
import { authService } from '../build/service/auth.service';
import { Admin } from '../build/model/Admin';
import { User } from '../build/model/User';
import { DB } from '../build/utils/db';
import { Op } from 'sequelize';
import * as bcrypt from 'bcrypt';

jest.spyOn(authService, 'check2fa' as any).mockImplementation(() => true);
jest.setTimeout(40000);
jest.mock('uuid', () => ({ v4: () => '0987654321' }));

describe('Check is application workable', () => {
  let adminToken;
  let userToken;

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

    it('Incorrect admin creation', async () => {
      let res;
      await handler(
        generalReq({
          method: 'POST',
          path: '/signup-admin',
          body: JSON.stringify({ email: 'example2@example.com', password: '12345678' }),
          headers: { 'secret-word': 'wrong-secret-word' }
        }),
        {} as any,
        (error, response) => {
          res = error || response;
        }
      );
      expect(res).toHaveProperty('statusCode', 400);
      expect(res).toHaveProperty('body');
      const body = JSON.parse(res.body);
      expect(body).toHaveProperty('error');
      expect(body.error).toHaveProperty('message', 'Wrong secret-word in header');
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

    it('Check login user', async () => {
      let res;
      await handler(
        generalReq({
          method: 'POST',
          path: '/login',
          body: JSON.stringify({
            email: 'example2@example.com',
            password: '12345678',
            type: 'user',
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
      userToken = body.data.token;
    });

    it('Check correct logout', async () => {
      let res;
      await handler(
        generalReq({
          method: 'POST',
          path: '/logout',
          headers: { authorization: adminToken }
        }),
        {} as any,
        (error, response) => {
          res = error || response;
        }
      );
      expect(res).toHaveProperty('statusCode', 201);
      expect(res).toHaveProperty('body', '{}');
    });

    it('Check incorrect logout', async () => {
      let res;
      await handler(
        generalReq({
          method: 'POST',
          path: '/logout'
        }),
        {} as any,
        (error, response) => {
          res = error || response;
        }
      );
      expect(res).toHaveProperty('statusCode', 403);
      expect(res).toHaveProperty('body');
      const body = JSON.parse(res.body);
      expect(body).toHaveProperty('error');
      expect(body.error).toHaveProperty('message', 'Wrong jwt token');
      expect(body.error).toHaveProperty('name', 'ForbidenError');
      expect(body.error).toHaveProperty('status', 403);
    });
  });

  describe('Check recovery flow', () => {
    it('Send a password recovery for User', async () => {
      let res;
      await handler(
        generalReq({
          method: 'POST',
          path: '/send-recovery-password',
          body: JSON.stringify({ email: 'example2@example.com' })
        }),
        {} as any,
        (error, response) => {
          res = error || response;
        }
      );
      expect(res).toHaveProperty('statusCode', 201);
      expect(res).toHaveProperty('body', '{}');
    });

    it('Make a password recovery for User', async () => {
      let res;
      await handler(
        generalReq({
          method: 'PATCH',
          path: '/recovery-password/0987654321',
          body: JSON.stringify({ password: 'abcabcabcabc' }),
          param: { token: '0987654321' }
        }),
        {} as any,
        (error, response) => {
          res = error || response;
        }
      );
      expect(res).toHaveProperty('statusCode', 200);
      expect(res).toHaveProperty('body');
      const body = JSON.parse(res.body);
      expect(body).toHaveProperty('data');
      expect(body.data).toHaveProperty('id');
      expect(body.data).toHaveProperty('email', 'example2@example.com');
      expect(body.data).toHaveProperty('recoveryToken', null);
      expect(body.data).toHaveProperty('password');
      expect(await bcrypt.compare('abcabcabcabc', body.data.password)).toBe(true);
    });

    it('Make a wrong password recovery for User', async () => {
      let res;
      await handler(
        generalReq({
          method: 'PATCH',
          path: '/recovery-password/0987654321',
          body: JSON.stringify({ password: 'abcabcabcabc' }),
          param: { token: '0987654321' }
        }),
        {} as any,
        (error, response) => {
          res = error || response;
        }
      );
      expect(res).toHaveProperty('statusCode', 404);
      expect(res).toHaveProperty('body');
      const body = JSON.parse(res.body);
      expect(body).toHaveProperty('error');
      expect(body.error).toHaveProperty('message', 'Not found user with this token');
    });

    it('Send a password recovery for Admin', async () => {
      let res;
      await handler(
        generalReq({
          method: 'POST',
          path: '/admin/send-recovery-password',
          body: JSON.stringify({ email: 'example2@example.com' })
        }),
        {} as any,
        (error, response) => {
          res = error || response;
        }
      );
      expect(res).toHaveProperty('statusCode', 201);
      expect(res).toHaveProperty('body', '{}');
    });

    it('Make a password recovery for Admin', async () => {
      let res;
      await handler(
        generalReq({
          method: 'PATCH',
          path: '/admin/recovery-password/0987654321',
          body: JSON.stringify({ password: 'abcabcabcabc' }),
          param: { token: '0987654321' }
        }),
        {} as any,
        (error, response) => {
          res = error || response;
        }
      );
      expect(res).toHaveProperty('statusCode', 200);
      expect(res).toHaveProperty('body');
      const body = JSON.parse(res.body);
      expect(body).toHaveProperty('data');
      expect(body.data).toHaveProperty('id');
      expect(body.data).toHaveProperty('email', 'example2@example.com');
      expect(body.data).toHaveProperty('recoveryToken', null);
      expect(body.data).toHaveProperty('password');
      expect(await bcrypt.compare('abcabcabcabc', body.data.password)).toBe(true);
    });

    it('Make a wrong password recovery for Admin', async () => {
      let res;
      await handler(
        generalReq({
          method: 'PATCH',
          path: '/admin/recovery-password/0987654321',
          body: JSON.stringify({ password: 'abcabcabcabc' }),
          param: { token: '0987654321' }
        }),
        {} as any,
        (error, response) => {
          res = error || response;
        }
      );
      expect(res).toHaveProperty('statusCode', 404);
      expect(res).toHaveProperty('body');
      const body = JSON.parse(res.body);
      expect(body).toHaveProperty('error');
      expect(body.error).toHaveProperty('message', 'Not found admin with this token');
    });
  });

  describe('Wort with 2fa', () => {
    it('set 2fa to User without token', async () => {
      let res;
      await handler(
        generalReq({
          method: 'PATCH',
          path: '/set-2fa'
        }),
        {} as any,
        (error, response) => {
          res = error || response;
        }
      );

      expect(res).toHaveProperty('statusCode', 403);
      expect(res).toHaveProperty('body');
      const body = JSON.parse(res.body);
      expect(body).toHaveProperty('error');
      expect(body.error).toHaveProperty('message', 'Wrong jwt token');
      expect(body.error).toHaveProperty('name', 'ForbidenError');
      expect(body.error).toHaveProperty('status', 403);
    });

    it('set 2fa to User', async () => {
      let res;
      await handler(
        generalReq({
          method: 'PATCH',
          path: '/set-2fa',
          headers: {
            authorization: userToken
          }
        }),
        {} as any,
        (error, response) => {
          res = error || response;
        }
      );

      expect(res).toHaveProperty('statusCode', 200);
      expect(res).toHaveProperty('body');
      const body = JSON.parse(res.body);
      expect(body).toHaveProperty('data');
      expect(body.data).toHaveProperty('key');
      expect(body.data).toHaveProperty('qrcode');
    });

    it('login to User', async () => {
      let res;
      await handler(
        generalReq({
          method: 'POST',
          path: '/login',
          body: JSON.stringify({
            email: 'example2@example.com',
            password: 'abcabcabcabc',
            type: 'user',
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
    });

    it('set 2fa to Admin without token', async () => {
      let res;
      await handler(
        generalReq({
          method: 'PATCH',
          path: '/admin/set-2fa'
        }),
        {} as any,
        (error, response) => {
          res = error || response;
        }
      );

      expect(res).toHaveProperty('statusCode', 403);
      expect(res).toHaveProperty('body');
      const body = JSON.parse(res.body);
      expect(body).toHaveProperty('error');
      expect(body.error).toHaveProperty('message', 'Wrong jwt token');
      expect(body.error).toHaveProperty('name', 'ForbidenError');
      expect(body.error).toHaveProperty('status', 403);
    });

    it('set 2fa to Admin', async () => {
      let res;
      await handler(
        generalReq({
          method: 'PATCH',
          path: '/admin/set-2fa',
          headers: { authorization: adminToken }
        }),
        {} as any,
        (error, response) => {
          res = error || response;
        }
      );

      expect(res).toHaveProperty('statusCode', 200);
      expect(res).toHaveProperty('body');
      const body = JSON.parse(res.body);
      expect(body).toHaveProperty('data');
      expect(body.data).toHaveProperty('key');
      expect(body.data).toHaveProperty('qrcode');
    });

    it('login to Admin', async () => {
      let res;
      await handler(
        generalReq({
          method: 'POST',
          path: '/login',
          body: JSON.stringify({
            email: 'example2@example.com',
            password: 'abcabcabcabc',
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
    });

    it('send a reques to recover a 2fa', async () => {
      let res;
      await handler(
        generalReq({
          method: 'PATCH',
          path: '/recovery-2fa',
          body: JSON.stringify({
            email: 'some_no_exist@email.com'
          })
        }),
        {} as any,
        (error, response) => {
          res = error || response;
        }
      );

      expect(res).toHaveProperty('statusCode', 200);
      expect(res).toHaveProperty('body', '{}');
    });
  });
});
