import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { House } from '../schemas/house.schema';
import { Types } from 'mongoose';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class HouseService {
  constructor(
    @InjectModel(House.name) private readonly houseModel: Model<House>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  // 1. Create a new house
  async createHouse(houseData: any, authHeader: string): Promise<House> {
    // Extract the Bearer token from the Authorization header
    const token = this.extractToken(authHeader);

    // Decode the token to get user info (assuming the userId is stored in the token payload)
    let userId: string;
    try {
      const decodedToken = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      userId = decodedToken.userId;
    } catch (error) {
      throw new UnauthorizedException('Token has expired or invalid');
    }

    const house = new this.houseModel({
      ...houseData,
      owner_id: userId,
    });

    return house.save();
  }

  private extractToken(authHeader: string): string {
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Bearer token is missing');
    }

    console.log('Extracted Token:', token); // Log token for debugging
    return token;
  }

  private decodeToken(token: string): { userId: string; role: string } {
    try {
      const decodedToken = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      return { userId: decodedToken.userId, role: decodedToken.role };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
  // 2. Get all houses (admin can see all houses)
  async getHouses(authHeader: string): Promise<House[]> {
    const token = this.extractToken(authHeader);
    const { userId, role } = this.decodeToken(token);

    let houses;
    if (role === 'admin') {
      // Admin can see all houses along with devices using aggregate and lookup
      houses = await this.houseModel.aggregate([
        {
          $lookup: {
            from: 'devices', // Name of the devices collection in the database
            localField: '_id', // Field in house collection
            foreignField: 'house_id', // Field in device collection that references house
            as: 'devices_info', // Alias for the joined data
          },
        },
      ]);
    } else {
      // User can see only their own houses with devices using aggregate and lookup
      houses = await this.houseModel.aggregate([
        {
          $match: {
            owner_id: new Types.ObjectId(userId), // Filter houses created by the user
          },
        },
        {
          $lookup: {
            from: 'devices', // Name of the devices collection
            localField: '_id', // Field in house collection
            foreignField: 'house_id', // Field in device collection that references house
            as: 'devices_info', // Alias for the joined data
          },
        },
      ]);
    }

    return houses;
  }

  async getHouseById(houseId: string, authHeader: string): Promise<House> {
    const token = this.extractToken(authHeader);
    const { userId, role } = this.decodeToken(token);

    const house = await this.houseModel.aggregate([
      {
        $match: { _id: new Types.ObjectId(houseId) }, // Use Types.ObjectId to create ObjectId from string
      },
      {
        $lookup: {
          from: 'devices',
          localField: '_id',
          foreignField: 'house_id',
          as: 'devices_info',
        },
      },
    ]);

    if (!house || house.length === 0) {
      throw new NotFoundException('House not found');
    }

    // Check if the user is authorized to view the house
    if (role !== 'admin' && house[0].created_by.toString() !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this house',
      );
    }

    return house[0]; // Return the first house, since `aggregate` returns an array
  }

  // 4. Update a house
  async updateHouse(
    houseId: string,
    authHeader: string,
    updateData: any,
  ): Promise<House> {
    const token = this.extractToken(authHeader);
    const { userId, role } = this.decodeToken(token);

    const house = await this.houseModel.findById(houseId).exec();
    if (!house) {
      throw new NotFoundException('House not found');
    }

    // Ensure only the user who created the house (or an admin) can update it
    if (house.owner_id.toString() !== userId && role !== 'admin') {
      throw new ForbiddenException(
        'You do not have permission to update this house',
      );
    }

    Object.assign(house, updateData);
    return house.save();
  }

  async deleteHouse(houseId: string, authHeader: string): Promise<void> {
    // Decode token to get user information
    const token = this.extractToken(authHeader);
    const { userId, role } = this.decodeToken(token);

    const house = await this.houseModel.findById(houseId).exec();
    if (!house) {
      throw new NotFoundException('House not found');
    }

    // Ensure only the user who created the house (or an admin) can delete it
    if (house.owner_id.toString() !== userId && role !== 'admin') {
      throw new ForbiddenException(
        'You do not have permission to delete this house',
      );
    }

    // Use deleteOne to remove the document
    await this.houseModel.deleteOne({ _id: houseId }).exec();
  }
}
