import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('users')
export class UsersController {
  constructor() {}

  @UseGuards(AuthGuard)
  @Get()
  getUsers() {
    return [];
  }
}
