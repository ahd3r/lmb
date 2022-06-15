import { parse } from 'node-html-parser';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import * as crypto from 'crypto';
import axios from 'axios';

import { AdminDetailsDto } from '../dtos/admin-details.dto';
import { ChangeAdminPasswordRequestDto } from '../dtos/change-admin-password-request.dto';
import { CreateAdminRequestDto } from '../dtos/create-admin-request.dto';
import { Admin } from '../model/Admin';
import { salt } from '../utils/config';
import { NotFoundError } from '../utils/errors';
import { Set2faResponseDto } from '../dtos/set-2fa-response.dto';

class AdminService {
  public async create(data: CreateAdminRequestDto): Promise<AdminDetailsDto> {
    const admin = new Admin({
      email: data.email,
      password: await bcrypt.hash(data.password, 10)
    });
    return new AdminDetailsDto(await admin.save());
  }

  public async setRecoveryToken(email: string): Promise<AdminDetailsDto> {
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      throw new NotFoundError('Not found admin with this email');
    }
    const recoveryToken = uuid();
    const updatedAdmin = await admin.update({ recoveryToken });
    console.log(`Some sort of sending letter to email ${email} with token ${recoveryToken}`);
    return new AdminDetailsDto(updatedAdmin);
  }

  public async changePassword(
    data: ChangeAdminPasswordRequestDto,
    token: string
  ): Promise<AdminDetailsDto> {
    const admin = await Admin.findOne({ where: { recoveryToken: token } });
    if (!admin) {
      throw new NotFoundError('Not found admin with this token');
    }
    return new AdminDetailsDto(
      await admin.update({ password: await bcrypt.hash(data.password, 10), recoveryToken: null })
    );
  }

  public async set2fa(admin: Admin): Promise<Set2faResponseDto> {
    const twofahash = crypto.createHash('md5').update(`${salt}${admin.email}`).digest('hex');
    const twofaResponse = await axios.get(
      `https://www.authenticatorApi.com/pair.aspx?AppName=lmb&AppInfo=${admin.email}&SecretCode=${twofahash}`
    );
    const key = parse(twofaResponse.data)
      .querySelector('a')
      .getAttribute('title')
      .slice('Manually pair with '.length);
    const imageUrl = parse(twofaResponse.data).querySelector('img').getAttribute('src');
    return new Set2faResponseDto(imageUrl, key);
  }
}

export const adminService = new AdminService();
