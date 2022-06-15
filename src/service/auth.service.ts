import { parse } from 'node-html-parser';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import axios from 'axios';
import { LoginRequestDto } from '../dtos/login-request.dto';
import { Admin } from '../model/Admin';
import { User } from '../model/User';
import { ValidationError } from '../utils/errors';
import { salt, secretKey } from '../utils/config';

class AuthService {
  public async createSession(data: LoginRequestDto): Promise<string> {
    let actor;
    if (data.type === 'admin') {
      actor = await Admin.findOne({ where: { email: data.email } });
    } else if (data.type === 'user') {
      actor = await User.findOne({ where: { email: data.email } });
    }
    if (!actor) {
      throw new ValidationError('This email does not exist');
    }
    if (!(await bcrypt.compare(data.password, actor.password))) {
      throw new ValidationError('Wrong password');
    }
    if (actor.twofa && !this.check2fa(data.code, data.email)) {
      throw new ValidationError('Wrong 2fa');
    }
    return jwt.sign({ type: data.type, id: actor.id }, secretKey, { expiresIn: '1d' });
  }

  private async check2fa(code: string, email: string): Promise<boolean> {
    const twofahash = crypto.createHash('md5').update(`${salt}${email}`).digest('hex');
    const twofaResponse = await axios.get(
      `https://www.authenticatorApi.com/Validate.aspx?Pin=${code}&SecretCode=${twofahash}`
    );
    return twofaResponse.data.toLowerCase() === 'true';
  }

  public async recovery2fa(email): Promise<void> {
    const twofahash = crypto.createHash('md5').update(`${salt}${email}`).digest('hex');
    const twofaResponse = await axios.get(
      `https://www.authenticatorApi.com/pair.aspx?AppName=lmb&AppInfo=${email}&SecretCode=${twofahash}`
    );
    const key = parse(twofaResponse.data)
      .querySelector('a')
      .getAttribute('title')
      .slice('Manually pair with '.length);
    console.log(`Send to this ${email} email this code - ${key}`);
  }
}

export const authService = new AuthService();
