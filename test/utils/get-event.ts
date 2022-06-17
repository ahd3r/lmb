export const generalReq = ({
  method,
  path,
  body,
  headers,
  query,
  param
}: {
  method: 'POST' | 'GET' | 'PATCH';
  path: string;
  body?: string;
  headers?: {
    'secret-word'?: string;
    authorization?: string;
  };
  query?: any;
  param?: any;
}): any => ({
  routeKey: `${method} ${path}`,
  headers,
  queryStringParameters: query,
  pathParameters: param,
  body
});
