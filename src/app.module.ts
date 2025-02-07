import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { PrismaModule } from './prisma/prisma.module';
import { JwtMiddleware } from './auth/jwt/jwt.middleware';
import { TwilioModule } from './twilio/twilio.module';

@Module({
  imports: [AuthModule, AppointmentsModule, PrismaModule, TwilioModule],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      // .forRoutes('*');
      .forRoutes('appointments'); // Apply only to routes under /appointments
  }
}
