import moment from 'moment';
import { time } from './utils'

console.log(moment().format('DD-MM-YYYY HH-mm-ss DD'));

export const handler = (event, context, callback) => {
  console.log(event, context, callback);
  callback(null, {
      statusCode: 200,
      body: JSON.stringify({data: time}),
  });
};
