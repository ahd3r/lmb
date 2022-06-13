import moment from 'moment';
import { time } from './utils'

console.log(moment().format('DD-MM-YYYY HH-mm-ss DD'));

// {
//   version: '2.0',
//   routeKey: 'GET /getTime',
//   rawPath: '/dev/getTime',
//   rawQueryString: '',
//   headers: {
//     accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
//     'accept-encoding': 'gzip, deflate, br',
//     'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,uk;q=0.6',
//     'content-length': '0',
//     host: '8a23p6mfwa.execute-api.us-east-1.amazonaws.com',
//     'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="99", "Google Chrome";v="99"',
//     'sec-ch-ua-mobile': '?0',
//     'sec-ch-ua-platform': '"Linux"',
//     'sec-fetch-dest': 'document',
//     'sec-fetch-mode': 'navigate',
//     'sec-fetch-site': 'none',
//     'sec-fetch-user': '?1',
//     'upgrade-insecure-requests': '1',
//     'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36',
//     'x-amzn-trace-id': 'Root=1-62a71371-7807dc3d5c46c9132b99d55e',
//     'x-forwarded-for': '195.72.147.250',
//     'x-forwarded-port': '443',
//     'x-forwarded-proto': 'https'
//   },
//   requestContext: {
//     accountId: '171895848393',
//     apiId: '8a23p6mfwa',
//     domainName: '8a23p6mfwa.execute-api.us-east-1.amazonaws.com',
//     domainPrefix: '8a23p6mfwa',
//     http: {
//       method: 'GET',
//       path: '/dev/getTime',
//       protocol: 'HTTP/1.1',
//       sourceIp: '195.72.147.250',
//       userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36'
//     },
//     requestId: 'Tp_5tjXaoAMEP5g=',
//     routeKey: 'GET /getTime',
//     stage: 'dev',
//     time: '13/Jun/2022:10:37:37 +0000',
//     timeEpoch: 1655116657171
//   },
//   isBase64Encoded: false
// }
// {
//   callbackWaitsForEmptyEventLoop: [Getter/Setter],
//   succeed: [Function (anonymous)],
//   fail: [Function (anonymous)],
//   done: [Function (anonymous)],
//   functionVersion: '$LATEST',
//   functionName: 'test-lmd',
//   memoryLimitInMB: '128',
//   logGroupName: '/aws/lambda/test-lmd',
//   logStreamName: '2022/06/13/[$LATEST]f4427be6daba4b719ad5470f915afb95',
//   clientContext: undefined,
//   identity: undefined,
//   invokedFunctionArn: 'arn:aws:lambda:us-east-1:171895848393:function:test-lmd',
//   awsRequestId: '31fd48ac-4851-437f-b82d-91912d67493a',
//   getRemainingTimeInMillis: [Function: getRemainingTimeInMillis]
// }

interface EventRequestI {
  version: string,
  routeKey: string,
  rawPath: string,
  rawQueryString: string,
  headers: object,
  requestContext: {
    accountId: string,
    apiId: string,
    domainName: string,
    domainPrefix: string,
    http: {
      method: string,
      path: string,
      protocol: string,
      sourceIp: string,
      userAgent: string
    },
    requestId: string,
    routeKey: string,
    stage: string,
    time: string,
    timeEpoch: number
  },
  isBase64Encoded: false
}

interface ContextRequestI {
  succeed: Function,
  fail: Function,
  done: Function,
  functionVersion: string,
  functionName: string,
  memoryLimitInMB: string,
  logGroupName: string,
  logStreamName: string,
  invokedFunctionArn: string,
  awsRequestId: string,
  getRemainingTimeInMillis: Function
}

export const handler = (event: EventRequestI, context: ContextRequestI, callback: Function) => {
  console.log(event, context, callback);
  callback(null, {
      statusCode: 200,
      body: JSON.stringify({data: time}),
  });
};
