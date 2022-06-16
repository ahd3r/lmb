import { handler } from '../build/index';
import { generalReq } from './utils/get-event';

describe('Check is application workable', () => {
  it('Check health check endpoint', async () => {
    let res;
    await handler(generalReq('GET', '/healthcheck'), {} as any, (error, response) => {
      res = error || response;
    });
    expect(res).toHaveProperty('data', 'lambda is working');
  });
});
