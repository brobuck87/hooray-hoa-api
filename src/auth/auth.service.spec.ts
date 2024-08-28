import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { AddressesService } from '../addresses/addresses.service';
import { Address } from '../addresses/address.entity';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let addressesService: AddressesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersService,
        AddressesService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Address),
          useValue: {
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    addressesService = module.get<AddressesService>(AddressesService);
  });

  describe('register', () => {
    it('should successfully register a new user and return a token', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const encryptedPassword = 'encryptedPassword123';
      const address1 = '123 Main St';
      const city = 'Orlando';
      const state = 'FL';
      const postalCode = '34786';
      const country = 'US';

      const user = new User();
      user.id = 1;
      user.email = email;
      user.password = encryptedPassword;

      const address = new Address();
      address.address1 = address1;
      address.city = city;
      address.state = state;
      address.postalCode = postalCode;
      address.country = country;

      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(null);
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(() => Promise.resolve(encryptedPassword));
      jest.spyOn(usersService, 'create').mockResolvedValue(user);
      jest.spyOn(addressesService, 'create').mockResolvedValue(address);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('token123');

      const registerBody = {
        email,
        password,
        address1,
        address2: undefined,
        address3: undefined,
        city,
        state,
        postalCode,
        country,
      };

      const result = await authService.register(registerBody);

      expect(usersService.findOneByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 12);
      expect(usersService.create).toHaveBeenCalledWith(
        email,
        encryptedPassword,
        { address1, city, country, postalCode, state },
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
      });
      expect(result).toEqual({ user, token: 'token123' });
    });

    it('should throw a ConflictException if email already exists', async () => {
      const email = 'existing@example.com';
      const password = 'password123';

      const existingUser = new User();
      existingUser.id = 1;
      existingUser.email = email;
      existingUser.password = 'encryptedPassword123';

      jest
        .spyOn(usersService, 'findOneByEmail')
        .mockResolvedValue(existingUser);

      const registerBody = {
        email,
        password,
        address1: '123 Main St',
        address2: undefined,
        address3: undefined,
        city: 'Orlando',
        state: 'FL',
        postalCode: '34786',
        country: 'US',
      };

      await expect(authService.register(registerBody)).rejects.toThrow(
        ConflictException,
      );
      expect(usersService.findOneByEmail).toHaveBeenCalledWith(email);
    });
  });

  describe('login', () => {
    it('should successfully log in a user and return a token', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 12);

      const user = new User();
      user.id = 1;
      user.email = email;
      user.password = hashedPassword;

      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(user);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true)); // Mock bcrypt.compare to return true
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('token123');

      const result = await authService.login(email, password);

      expect(usersService.findOneByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
      });
      expect(result).toEqual({ token: 'token123' });
    });

    it('should throw an UnauthorizedException if password is incorrect', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const encryptedPassword = bcrypt.hashSync('password123', 12);

      const user = new User();
      user.id = 1;
      user.email = email;
      user.password = encryptedPassword;

      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(user);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));

      await expect(authService.login(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersService.findOneByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, encryptedPassword);
    });

    it('should throw an UnauthorizedException if user is not found', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';

      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(null);

      await expect(authService.login(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersService.findOneByEmail).toHaveBeenCalledWith(email);
    });
  });
});
