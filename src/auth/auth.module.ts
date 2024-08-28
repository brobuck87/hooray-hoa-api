import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { jwtConstants } from './constants';
import { UsersService } from '../users/users.service';
import { AddressesService } from '../addresses/addresses.service';
import { AddressesModule } from '../addresses/addresses.module';

@Module({
  imports: [
    UsersModule,
    AddressesModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [AuthService, UsersService, AddressesService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
