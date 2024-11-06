import {
  Controller,
  Put,
  Delete,
  Param,
  Body,
  Req,
  Post,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import { HouseService } from '../services/house.service';

@Controller('houses')
export class HouseController {
  constructor(private readonly houseService: HouseService) {}

  @Post()
  async createHouse(@Body() body, @Req() req) {
    const authHeader = req.headers.authorization;
    const house = await this.houseService.createHouse(body, authHeader);
    return {
      status: 'success',
      statusCode: 201,
      data: house,
    };
  }

  @Get()
  async getHouses(@Req() req) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }
    const houses = await this.houseService.getHouses(authHeader);
    return {
      status: 'success',
      statusCode: 200,
      data: houses,
    };
  }

  @Get(':id')
  async getHouseById(@Param('id') houseId: string, @Req() req) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }
    const house = await this.houseService.getHouseById(houseId, authHeader);
    return {
      status: 'success',
      statusCode: 200,
      data: house,
    };
  }

  @Put(':id')
  async updateHouse(@Param('id') houseId: string, @Body() body, @Req() req) {
    const authHeader = req.headers.authorization;
    const house = await this.houseService.updateHouse(
      houseId,
      authHeader,
      body,
    );
    return {
      status: 'success',
      statusCode: 200,
      data: house,
    };
  }

  @Delete(':id')
  async deleteHouse(@Param('id') houseId: string, @Req() req) {
    const authHeader = req.headers.authorization;
    await this.houseService.deleteHouse(houseId, authHeader);
    return {
      status: 'success',
      statusCode: 200,
      data: null,
    };
  }
}
