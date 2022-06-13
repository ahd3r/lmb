import moment from 'moment';
import { time } from './utils'

console.log(moment().format('DD-MM-YYYY HH-mm-ss DD'));

export const handler = (...args: any[]) => {
  console.log(args);
  return {
      statusCode: 200,
      body: JSON.stringify({data: time}),
  };
};
