import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async bookAppointment(
    date: string,
    hour: number,
    userId: string,
  ): Promise<void> {
    // Check if the user already has an appointment at the same date and hour
    const existingAppointment = await this.prisma.appointment.findFirst({
      where: {
        date: new Date(date),
        hour,
        userId,
      },
    });

    if (existingAppointment) {
      throw new BadRequestException(
        'You already have an appointment for this hour.',
      );
    }

    // Check if the hour already has 4 appointments
    const appointmentsAtHour = await this.prisma.appointment.findMany({
      where: { date: new Date(date), hour },
    });

    if (appointmentsAtHour.length >= 4) {
      throw new BadRequestException('This hour is fully booked.');
    }

    // Create a new appointment
    await this.prisma.appointment.create({
      data: {
        date: new Date(date),
        hour,
        userId,
      },
    });
  }

  async getAvailableHours(date: string): Promise<number[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: { date: new Date(date) },
    });

    const bookedHours = appointments.map((appointment) => appointment.hour);
    const allHours = Array.from({ length: 24 }, (_, i) => i); // Hours 0-23

    return allHours.filter((hour) => {
      const isFullyBooked = bookedHours.filter((h) => h === hour).length >= 4;
      return !isFullyBooked; // Only return hours that are not fully booked
    });
  }

  async getAllAppointments() {
    return this.prisma.appointment.findMany({
      include: { user: true }, // Include user details if needed
    });
  }

  async getUserAppointments(userId: string) {
    return this.prisma.appointment.findMany({
      where: { userId },
      orderBy: { date: 'asc' }, // Sort by date (optional)
    });
  }
}
