import { EventRequestI } from '..';
import { CreateUserRequestDto } from '../dtos/create-user-request.dto';
import { Set2faResponseDto } from '../dtos/set-2fa-response.dto';
import { UserDetailsDto } from '../dtos/user-details.dto';
import { userService } from '../service/user.service';
import { AccountType } from '../utils/account-type-decorator';
import { Body, PassArgs } from '../utils/pass-args-decorator';

class UserController {
  @PassArgs
  public async create(
    @Body(CreateUserRequestDto) data: CreateUserRequestDto
  ): Promise<UserDetailsDto> {
    return await userService.create(data);
  }

  @PassArgs
  @AccountType('user', 'admin')
  public async set2fa(event: EventRequestI): Promise<Set2faResponseDto> {
    return userService.set2fa(event.user);
  }
}

export const userController = new UserController();
