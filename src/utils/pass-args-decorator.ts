import { validateSync } from 'class-validator';
import { EventRequestI } from '..';
import { ArrayValidationError } from './errors';

interface ParamProxy {
  [methodName: string]: {
    [index: number]: {
      validationDto?: any;
      valueType: 'Body' | 'Param' | 'Header' | 'Query';
      valueKey?: string;
    };
  };
}

export const PassArgs = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
  const param: ParamProxy = Reflect.getMetadata('parameter-proxy', target) || {};
  const saveDescriptorValue = descriptor.value;
  descriptor.value = async (event: EventRequestI) => {
    const args = Object.entries(param[propertyKey])
      .map(([key, value]) => [Number(key), value])
      .sort(([a]: any, [b]: any) => a - b)
      .map(([key, value]: any) => {
        if (value.valueType === 'Body') {
          const arg = JSON.parse(event.body);
          if (value.validationDto) {
            const validateObj = new value.validationDto();
            Object.entries(arg).forEach(([key, value]) => {
              validateObj[key] = value;
            });
            const errors = validateSync(validateObj);
            if (errors?.length) {
              throw new ArrayValidationError('Body Validator Error', errors);
            }
            return validateObj;
          }
          return arg;
        } else if (value.valueType === 'Param') {
          const arg = event.pathParameters;
          if (value.valueKey) {
            return arg[value.valueKey];
          }
          return arg;
        } else if (value.valueType === 'Header') {
          if (value.valueKey) {
            return event.headers[value.valueKey];
          }
          return event.headers;
        } else if (value.valueType === 'Query') {
          const arg = event.queryStringParameters;
          if (value.valueKey) {
            return arg[value.valueKey];
          }
          return arg;
        }
      });

    return await saveDescriptorValue(...args, event);
  };
};

export const Body = (dto: any) => (target: any, propertyKey: string, argIndex: number) => {
  const param: ParamProxy = Reflect.getMetadata('parameter-proxy', target) || {};
  param[propertyKey] = param[propertyKey] || {};
  param[propertyKey][argIndex] = {
    validationDto: dto,
    valueType: 'Body'
  };
  Reflect.defineMetadata('parameter-proxy', param, target);
};

export const Param = (key: string) => (target: any, propertyKey: string, argIndex: number) => {
  const param: ParamProxy = Reflect.getMetadata('parameter-proxy', target) || {};
  param[propertyKey] = param[propertyKey] || {};
  param[propertyKey][argIndex] = {
    valueType: 'Param',
    valueKey: key
  };
  Reflect.defineMetadata('parameter-proxy', param, target);
};

export const Header = (key: string) => (target: any, propertyKey: string, argIndex: number) => {
  const param: ParamProxy = Reflect.getMetadata('parameter-proxy', target) || {};
  param[propertyKey] = param[propertyKey] || {};
  param[propertyKey][argIndex] = {
    valueType: 'Header',
    valueKey: key
  };
  Reflect.defineMetadata('parameter-proxy', param, target);
};

export const Query = (key: string) => (target: any, propertyKey: string, argIndex: number) => {
  const param: ParamProxy = Reflect.getMetadata('parameter-proxy', target) || {};
  param[propertyKey] = param[propertyKey] || {};
  param[propertyKey][argIndex] = {
    valueType: 'Query',
    valueKey: key
  };
  Reflect.defineMetadata('parameter-proxy', param, target);
};
