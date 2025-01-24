import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { Roles } from 'src/auth/roles/roles.decorator';
import { Role } from 'src/auth/roles/roles.enum';
import { IAuthorizedRequestInterface } from 'src/types/User';

@Controller('appointments')
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Get('available')
  async getAvailableHours(@Query('date') date: string): Promise<number[]> {
    if (!date) {
      throw new Error('Date query parameter is required');
    }

    return this.appointmentsService.getAvailableHours(date);
  }

  @Post('book')
  async bookAppointment(
    @Req() req: IAuthorizedRequestInterface,
    @Body() body: { date: string; hour: number },
  ): Promise<{ message: string }> {
    const user = req.user; // Access the user from the request
    console.log('user', user);

    if (!user || !user.userId) {
      throw new UnauthorizedException(
        'Invalid token or user not authenticated',
      );
    }

    await this.appointmentsService.bookAppointment(
      body.date,
      body.hour,
      user.userId,
    );

    return { message: 'Appointment booked successfully.' };
  }

  @Get('all')
  @Roles(Role.ADMIN) // Only admins can access this route
  async getAllAppointments() {
    return this.appointmentsService.getAllAppointments();
  }

  @Get('my-appointments')
  async getUserAppointments(@Req() req: IAuthorizedRequestInterface) {
    const user = req.user; // Extract user info from the token
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.appointmentsService.getUserAppointments(user.userId);
  }
}
