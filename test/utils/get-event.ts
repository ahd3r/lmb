export const generalReq = (
  method: 'POST' | 'GET' | 'PATCH',
  path: string,
  body?: string,
  auth?: string,
  query?: any,
  param?: any
): any => ({
  routeKey: `${method} ${path}`,
  headers: {
    authorization: auth
  },
  queryStringParameters: query,
  pathParameters: param,
  body
});
