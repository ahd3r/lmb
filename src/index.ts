import 'reflect-metadata';

import { adminController } from './controller/admin.controller';
import { authController } from './controller/auth.controller';
import { userController } from './controller/user.controller';
import { Admin } from './model/Admin';
import { User } from './model/User';
import { DB } from './utils/db';
import { NotFoundError, ServerError } from './utils/errors';

export interface EventRequestI {
  version: string;
  routeKey: string;
  rawPath: string;
  rawQueryString: string;
  headers: any;
  queryStringParameters?: any;
  requestContext: {
    accountId: string;
    apiId: string;
    domainName: string;
    domainPrefix: string;
    http: {
      method: string;
      path: string;
      protocol: string;
      sourceIp: string;
      userAgent: string;
    };
    requestId: string;
    routeKey: string;
    stage: string;
    time: string;
    timeEpoch: number;
  };
  pathParameters?: any;
  body?: string;
  isBase64Encoded: boolean;
  user?: User | Admin;
}

interface ContextRequestI {
  succeed: Function;
  fail: Function;
  done: Function;
  functionVersion: string;
  functionName: string;
  memoryLimitInMB: string;
  logGroupName: string;
  logStreamName: string;
  invokedFunctionArn: string;
  awsRequestId: string;
  getRemainingTimeInMillis: Function;
}

export const handler = async (
  event: EventRequestI,
  context: ContextRequestI,
  callback: Function
) => {
  console.log(event);
  const db = await DB.getDb();

  try {
    let data;
    let pagination;
    const [method, route] = event.routeKey.split(' ');
    switch (true) {
      case method === 'GET' && route === '/healthcheck':
        data = 'lambda is working';
        break;
      case method === 'POST' && route === '/signup':
        data = await (userController.create as any)(event);
        break;
      case method === 'POST' && route === '/signup-admin':
        data = await (adminController.create as any)(event);
        break;
      case method === 'POST' && route === '/login':
        data = await (authController.login as any)(event);
        break;
      case method === 'POST' && route === '/logout':
        data = await (authController.logout as any)(event);
        break;
      case method === 'POST' && route === '/send-recovery-password':
        data = await (authController.sendRecoveryPassword as any)(event);
        break;
      case method === 'PATCH' && route === '/set-2fa':
        data = await (userController.set2fa as any)(event);
        break;
      case method === 'PATCH' && route === '/admin/set-2fa':
        data = await (adminController.set2fa as any)(event);
        break;
      case method === 'POST' && route === '/admin/send-recovery-password':
        data = await (authController.sendAdminRecoveryPassword as any)(event);
        break;
      case method === 'PATCH' && route.startsWith('/recovery-password'):
        data = await (authController.recoveryPassword as any)(event);
        break;
      case method === 'PATCH' && route.startsWith('/admin/recovery-password'):
        data = await (authController.recoveryAdminPassword as any)(event);
        break;
      case method === 'PATCH' && route === '/recovery-2fa':
        data = await (authController.recovery2fa as any)(event);
        break;
      default:
        throw new NotFoundError('Not found route');
    }

    console.log({ data, pagination });
    callback(null, {
      statusCode: method === 'POST' ? 201 : 200,
      body: JSON.stringify({ data, pagination })
    });
  } catch (error: any) {
    let err = error;

    if (!err.status) {
      err = new ServerError(error.message);
    }

    console.error(err);
    callback(null, {
      statusCode: err.status,
      body: JSON.stringify({
        error: { message: err.message, status: err.status, name: err.name, errors: err.errors }
      })
    });
  } finally {
    await db.close();
  }
};
