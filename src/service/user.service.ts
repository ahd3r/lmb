import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { parse } from 'node-html-parser';
import * as crypto from 'crypto';
import axios from 'axios';

import { ChangeUserPasswordRequestDto } from '../dtos/change-user-password-request.dto';
import { CreateUserRequestDto } from '../dtos/create-user-request.dto';
import { Set2faResponseDto } from '../dtos/set-2fa-response.dto';
import { UserDetailsDto } from '../dtos/user-details.dto';
import { User } from '../model/User';
import { NotFoundError, ValidationError } from '../utils/errors';
import { salt } from '../utils/config';

class UserService {
  public async create(data: CreateUserRequestDto): Promise<UserDetailsDto> {
    const userWithEmail = await User.findOne({ where: { email: data.email } });
    if (userWithEmail) {
      throw new ValidationError('User with this email already exist');
    }
    const user = new User({
      email: data.email,
      password: await bcrypt.hash(data.password, 10)
    });
    return new UserDetailsDto(await user.save());
  }

  public async setRecoveryToken(email: string): Promise<UserDetailsDto> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundError('Not found user with this email');
    }
    const recoveryToken = uuid();
    const updatedUser = await user.update({ recoveryToken });
    console.log(`Some sort of sending letter to email ${email} with token ${recoveryToken}`);
    return new UserDetailsDto(updatedUser);
  }

  public async changePassword(
    data: ChangeUserPasswordRequestDto,
    token: string
  ): Promise<UserDetailsDto> {
    const user = await User.findOne({ where: { recoveryToken: token } });
    if (!user) {
      throw new NotFoundError('Not found user with this token');
    }
    return new UserDetailsDto(
      await user.update({ password: await bcrypt.hash(data.password, 10), recoveryToken: null })
    );
  }

  public async set2fa(user: User): Promise<Set2faResponseDto> {
    const twofahash = crypto.createHash('md5').update(`${salt}${user.email}`).digest('hex');
    const twofaResponse = await axios.get(
      `https://www.authenticatorApi.com/pair.aspx?AppName=lmb&AppInfo=${user.email}&SecretCode=${twofahash}`
    );
    const key = parse(twofaResponse.data)
      .querySelector('a')
      .getAttribute('title')
      .slice('Manually pair with '.length);
    const imageUrl = parse(twofaResponse.data).querySelector('img').getAttribute('src');
    return new Set2faResponseDto(imageUrl, key);
  }
}

export const userService = new UserService();
