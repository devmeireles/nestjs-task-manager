import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { User } from './user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async singnUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    const { username, password } = authCredentialsDto;

    const user = new User();
    user.username = username;
    user.salt = await bcrypt.genSalt();
    user.password = await this.hashPasswod(password, user.salt);

    try {
      await user.save();
    } catch (error) {
      console.log(error.code);
      if (parseInt(error.code) === 23505) {
        throw new ConflictException("Username already exists");
      } else {
        throw new InternalServerErrorException();

      }
    }
  }

  async validateUserPassword(authCredentialsDto: AuthCredentialsDto): Promise<string> {
    const { username, password } = authCredentialsDto;

    const user = await this.findOne({
      where: {
        username
      }
    });

    if (user && await user.validatePassword(password)) {
      return user.username;
    }
  }

  private async hashPasswod(password: string, salt: string): Promise<string> {
    return await bcrypt.hash(password, salt);
  }
}
