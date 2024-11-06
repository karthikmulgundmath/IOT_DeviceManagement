import {
  Controller,
  Post,
  Body,
  Get,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  // Register a new user
  @Post('register')
  async register(@Body() userData) {
    try {
      const user = await this.userService.registerUser(userData);
      return {
        statusCode: HttpStatus.CREATED,
        data: user,
        statusString: 'User created successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          error: error.message,
          statusString: 'Failed to create user',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Login a user and return JWT token
  @Post('login')
  async login(@Body() { email, password }) {
    try {
      const tokens = await this.authService.login(email, password);
      return {
        statusCode: HttpStatus.OK,
        data: tokens,
        statusString: 'User logged in successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          error: error.message,
          statusString: 'Invalid credentials',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Post('refreshtoken')
  async refreshAccessToken(@Body() { refreshToken }) {
    try {
      const token = await this.authService.refreshAccessToken(refreshToken);
      return {
        statusCode: HttpStatus.OK,
        data: token,
        statusString: 'Access token refreshed successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          error: error.message,
          statusString: 'Invalid refresh token',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
