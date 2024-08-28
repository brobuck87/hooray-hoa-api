import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from './address.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
  ) {}

  create(
    address1: string,
    address2: string | undefined,
    address3: string,
    city: string,
    state: string,
    postalCode: string,
    country: string,
  ): Promise<Address> {
    return this.addressRepository.save({
      address1,
      address2,
      address3,
      city,
      state,
      postalCode,
      country,
    });
  }
}
