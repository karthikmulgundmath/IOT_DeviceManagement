import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { userId: user._id, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' }); // 1-hour expiry
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' }); // 7-day expiry

    return { accessToken, refreshToken };
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string }> {
    try {
      const decoded = this.jwtService.verify(refreshToken);

      const newAccessToken = this.jwtService.sign(
        { userId: decoded.userId, role: decoded.role },
        { expiresIn: '1h' },
      );

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
