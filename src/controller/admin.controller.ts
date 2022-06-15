import { EventRequestI } from '..';
import { AdminDetailsDto } from '../dtos/admin-details.dto';
import { CreateAdminRequestDto } from '../dtos/create-admin-request.dto';
import { Set2faResponseDto } from '../dtos/set-2fa-response.dto';
import { adminService } from '../service/admin.service';
import { AccountType } from '../utils/account-type-decorator';
import { secretWord } from '../utils/config';
import { ValidationError } from '../utils/errors';
import { Body, Header, PassArgs } from '../utils/pass-args-decorator';

class AdminController {
  @PassArgs
  public async create(
    @Body(CreateAdminRequestDto) data: CreateAdminRequestDto,
    @Header('secret-word') headerSecretWord: string
  ): Promise<AdminDetailsDto> {
    if (secretWord !== headerSecretWord) {
      throw new ValidationError('Wrong secret-word in header');
    }
    return adminService.create(data);
  }

  @PassArgs
  @AccountType('user', 'admin')
  public async set2fa(event: EventRequestI): Promise<Set2faResponseDto> {
    return adminService.set2fa(event.user);
  }
}

export const adminController = new AdminController();
