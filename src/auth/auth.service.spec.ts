import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { User } from '../users/user.entity';
import * as bcrypt from 'bcrypt';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersService,
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
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should successfully register a new user and return a token', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const encryptedPassword = 'encryptedPassword123';

      const user = new User();
      user.id = 1;
      user.email = email;
      user.password = encryptedPassword;

      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(null);
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(() => Promise.resolve(encryptedPassword));
      jest.spyOn(usersService, 'create').mockResolvedValue(user);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('token123');

      const result = await authService.register(email, password);

      expect(usersService.findOneByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 12);
      expect(usersService.create).toHaveBeenCalledWith(
        email,
        encryptedPassword,
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

      await expect(authService.register(email, password)).rejects.toThrow(
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
