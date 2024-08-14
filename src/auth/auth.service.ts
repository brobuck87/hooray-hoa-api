import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private async encryptpass(password: string) {
    return bcrypt.hash(password, 12);
  }
  private async comparepassword(password: string, hashPassword: string) {
    return bcrypt.compare(password, hashPassword);
  }

  async register(
    email: string,
    password: string,
  ): Promise<{ user: User; token: string }> {
    // Check if the email already exists
    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash the password before saving it
    const encryptedPassword = await this.encryptpass(password);

    // Create a new user entity
    const user = await this.usersService.create(email, encryptedPassword);

    // Save the new user to the database
    const payload = { sub: user.id, email: user.email };
    const token = await this.jwtService.signAsync(payload);
    return { user, token };
  }

  async login(email: string, password: string): Promise<{ token: string }> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.comparepassword(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    const token = await this.jwtService.signAsync(payload);

    return { token };
  }
}
