import * as jwt from 'jsonwebtoken';
import { EventRequestI } from '..';
import { Admin } from '../model/Admin';
import { User } from '../model/User';
import { secretKey } from './config';
import { ForbidenError } from './errors';

export const AccountType =
  (...types: string[]) =>
  (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const saveDescriptorValue = descriptor.value;
    descriptor.value = async (event: EventRequestI) => {
      let tokenPayload;
      try {
        tokenPayload = jwt.verify(event.headers.authorization, secretKey) as any;
      } catch (e) {
        throw new ForbidenError('Wrong jwt token');
      }

      if (!types.includes(tokenPayload.type)) {
        throw new ForbidenError('Wrong account type');
      }

      if (tokenPayload.type === 'user') {
        const user = await User.findOne({ where: { id: tokenPayload.id } });
        if (!user) {
          throw new ForbidenError('This is does not exist');
        }
        event.user = user;
      }

      if (tokenPayload.type === 'admin') {
        const admin = await Admin.findOne({ where: { id: tokenPayload.id } });
        if (!admin) {
          throw new ForbidenError('This is does not exist');
        }
        event.user = admin;
      }

      return await saveDescriptorValue(event);
    };
  };
