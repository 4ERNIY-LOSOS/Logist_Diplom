import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from '../user/entities/user.entity';
import { RoleName } from './enums/role-name.enum'; // Import RoleName
import { EmailService } from './email.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findOneByUsername(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User) {
    const payload = {
      username: user.username,
      sub: user.id,
      role: user.role.name,
      companyId: user.company?.id,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(createUserDto: CreateUserDto): Promise<User> {
    // Force the role to CLIENT for all self-registrations to prevent privilege escalation.
    createUserDto.role = RoleName.CLIENT;

    const verificationToken = uuidv4();

    // Delegate creation to UserService, which handles hashing and relations
    const user = await this.userService.create({
      ...createUserDto,
    });

    user.emailVerificationToken = verificationToken;
    user.isEmailVerified = false;
    await this.userService.updateRaw(user.id, {
      emailVerificationToken: verificationToken,
      isEmailVerified: false
    });

    await this.emailService.sendVerificationEmail(user.email, verificationToken);

    return user;
  }

  async verifyEmail(token: string): Promise<boolean> {
    const user = await this.userService.findOneByVerificationToken(token);
    if (!user) {
      throw new BadRequestException('Invalid or expired verification token.');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    await this.userService.updateRaw(user.id, {
      isEmailVerified: true,
      emailVerificationToken: null
    });

    return true;
  }
}
