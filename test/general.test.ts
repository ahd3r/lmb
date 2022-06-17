import { handler } from '../build/index';
import { generalReq } from './utils/get-event';
import { authService } from '../build/service/auth.service';

jest.spyOn(authService, 'check2fa' as any).mockImplementation(() => true);

describe('Check is application workable', () => {
  it('Check health check endpoint', async () => {
    let res;
    await handler(generalReq('GET', '/healthcheck'), {} as any, (error, response) => {
      res = error || response;
    });
    expect(res).toHaveProperty('statusCode', 200);
    expect(res).toHaveProperty('body');
    const body = JSON.parse(res.body);
    expect(body).toHaveProperty('data', 'lambda is working');
  });

  it('Check login root admin', async () => {
    let res;
    await handler(
      generalReq(
        'POST',
        '/login',
        JSON.stringify({
          email: 'example@example.com',
          password: 'adminadmin',
          type: 'admin',
          code: '123456'
        })
      ),
      {} as any,
      (error, response) => {
        res = error || response;
      }
    );
    console.log(res);
    expect(res).toHaveProperty('statusCode', 201);
    expect(res).toHaveProperty('body');
    const body = JSON.parse(res.body);
    expect(body).toHaveProperty('data');
  });
});
