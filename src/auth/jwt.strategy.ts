import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtPayload } from './jwt-payload.interface';
import { User } from './user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    private userRepository: UserRepository

    constructor(userRepository: UserRepository) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: 'topSecretHash'
        });

        this.userRepository = userRepository
    }

    async validate(payload: JwtPayload): Promise<User> {
        const { username } = payload;

        const user = await this.userRepository.findOne({
            where: {
                username
            }
        });

        if (!user) {
            throw new UnauthorizedException();
        }

        return user;
    }
}