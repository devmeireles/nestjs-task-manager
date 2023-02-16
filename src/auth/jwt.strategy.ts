import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import * as config from 'config';
import { JwtPayload } from './jwt-payload.interface';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { IJwtConfig } from '../config/config.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    private userRepository: UserRepository

    constructor(userRepository: UserRepository) {
        const jwtConfig = config.get<IJwtConfig>('jwt');

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtConfig.secret
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