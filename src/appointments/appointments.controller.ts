import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { Roles } from 'src/auth/roles/roles.decorator';
import { Role } from 'src/auth/roles/roles.enum';
import { IAuthorizedRequestInterface } from 'src/types/User';
import { RolesGuard } from 'src/auth/roles/roles.guard';

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

  @Get('available/slots')
  async getAvailableSlots(
    @Query('date') date: string,
    @Query('hour') hour: string,
  ) {
    return this.appointmentsService.getAvailableSlots(date, parseInt(hour));
  }

  @Post('book')
  async bookAppointment(
    @Req() req: IAuthorizedRequestInterface,
    @Body()
    body: { date: string; hour: number; slots: number; isPaid: boolean },
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
      body.slots,
      body.isPaid,
      user.userId,
    );

    return { message: 'Appointment booked successfully.' };
  }

  @Get('all')
  @Roles(Role.ADMIN) // Only allow admins
  @UseGuards(RolesGuard)
  async getAllAppointments() {
    // Fetch all appointments with user details
    return await this.appointmentsService.getAllAppointments();
  }

  @Get('my-appointments')
  async getUserAppointments(@Req() req: IAuthorizedRequestInterface) {
    const user = req.user; // Extract user info from the token
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.appointmentsService.getUserAppointments(user.userId);
  }

  @Patch('approve/:id')
  async approveAppointment(@Param('id') appointmentId: string) {
    return this.appointmentsService.approveAppointment(appointmentId);
  }
}
