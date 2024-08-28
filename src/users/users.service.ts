import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Address } from '../addresses/address.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  findOneByEmail(email: string): Promise<User | null> {
    if (!email) {
      throw new BadRequestException('Email must be provided');
    }
    return this.usersRepository.findOneBy({ email });
  }

  async create(
    email: string,
    password: string,
    address: Address,
  ): Promise<User> {
    const user = this.usersRepository.create({
      email,
      password,
    });
    user.address = address;
    await this.usersRepository.save(user);
    return user;
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
