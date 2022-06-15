import { LoginResponseDto } from '../dtos/login-response.dto';
import { AccountType } from '../utils/account-type-decorator';
import { authService } from '../service/auth.service';
import { Body, Header, Param, PassArgs } from '../utils/pass-args-decorator';
import { LoginRequestDto } from '../dtos/login-request.dto';
import { UserDetailsDto } from '../dtos/user-details.dto';
import { AdminDetailsDto } from '../dtos/admin-details.dto';
import { UserRecoveryRequestDto } from '../dtos/user-recovery-request.dto';
import { AdminRecoveryRequestDto } from '../dtos/admin-recovery-request.dto';
import { ChangeUserPasswordRequestDto } from '../dtos/change-user-password-request.dto';
import { ChangeAdminPasswordRequestDto } from '../dtos/change-admin-password-request.dto';
import { Recovery2faRequestDto } from '../dtos/2fa-recovery-request.dto';
import { userService } from '../service/user.service';
import { adminService } from '../service/admin.service';

class AuthController {
  @PassArgs
  public async login(@Body(LoginRequestDto) data: LoginRequestDto): Promise<LoginResponseDto> {
    const token: string = await authService.createSession(data);
    return new LoginResponseDto(token);
  }

  @PassArgs
  @AccountType('user', 'admin')
  public async logout(@Header('authorization') token: string): Promise<void> {
    console.log(token);
    console.log('Redundant method, just for amount');
  }

  @PassArgs
  public async sendRecoveryPassword(
    @Body(UserRecoveryRequestDto) data: UserRecoveryRequestDto
  ): Promise<void> {
    await userService.setRecoveryToken(data.email);
  }

  @PassArgs
  public async sendAdminRecoveryPassword(
    @Body(AdminRecoveryRequestDto) data: AdminRecoveryRequestDto
  ): Promise<void> {
    await adminService.setRecoveryToken(data.email);
  }

  @PassArgs
  public async recoveryPassword(
    @Param('token') recoveryToken: string,
    @Body(ChangeUserPasswordRequestDto) data: ChangeUserPasswordRequestDto
  ): Promise<UserDetailsDto> {
    return await userService.changePassword(data, recoveryToken);
  }

  @PassArgs
  public async recoveryAdminPassword(
    @Param('token') recoveryToken: string,
    @Body(ChangeAdminPasswordRequestDto) data: ChangeAdminPasswordRequestDto
  ): Promise<AdminDetailsDto> {
    return await adminService.changePassword(data, recoveryToken);
  }

  @PassArgs
  public async recovery2fa(
    @Body(Recovery2faRequestDto) data: Recovery2faRequestDto
  ): Promise<void> {
    await authService.recovery2fa(data.email);
  }
}

export const authController = new AuthController();
