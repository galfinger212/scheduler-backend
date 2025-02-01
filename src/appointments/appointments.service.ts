import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TwilioService } from 'src/twilio/twilio.service';

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private readonly twilioService: TwilioService,
  ) {}

  async bookAppointment(
    date: string,
    hour: number,
    slots: number,
    isPaid: boolean,
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

    // Check if the hour already has 4 appointments
    const appointmentsAtHour = await this.prisma.appointment.findMany({
      where: { date: new Date(date), hour },
    });

    const allSlots = appointmentsAtHour.reduce(
      (total, appointment) => total + appointment.slots,
      0,
    );

    if (allSlots >= 4) {
      throw new BadRequestException('This hour is fully booked.');
    }

    if (existingAppointment) {
      // update the existing appointment
      await this.prisma.appointment.update({
        where: { id: existingAppointment.id },
        data: { slots: existingAppointment.slots + slots },
      });
      return;
    }

    const appointmentDate = new Date(date);

    // Check if the user already has an appointment on this date (any hour)
    const existingAppointmentForDay = await this.prisma.appointment.findFirst({
      where: {
        date: appointmentDate,
        userId,
      },
    });

    if (existingAppointmentForDay) {
      throw new BadRequestException(
        'You can only schedule one appointment per day.',
      );
    }
    // Create a new appointment
    await this.prisma.appointment.create({
      data: {
        date: new Date(date),
        hour,
        userId,
        slots,
        isPaid,
      },
    });
  }

  async getAvailableHours(date: string): Promise<number[]> {
    // Fetch all appointments for the given date
    const appointments = await this.prisma.appointment.findMany({
      where: { date: new Date(date) },
    });

    // Group and sum slots by hour
    const bookedSlotsByHour = appointments.reduce(
      (acc, appointment) => {
        acc[appointment.hour] =
          (acc[appointment.hour] || 0) + appointment.slots;
        return acc;
      },
      {} as Record<number, number>,
    );

    // Generate all hours from 10:00 to 22:00
    const allHours = Array.from({ length: 13 }, (_, i) => i + 10); // [10, 11, ..., 22]

    // Filter hours that are not fully booked
    return allHours.filter((hour) => {
      const bookedSlots = bookedSlotsByHour[hour] || 0; // Default to 0 if no bookings for the hour
      const maxSlots = 4; // Maximum slots per hour
      return bookedSlots < maxSlots; // Only include hours with available slots
    });
  }

  async getAvailableSlots(date: string, hour: number): Promise<number> {
    // Fetch all appointments for the given date and hour
    const appointments = await this.prisma.appointment.findMany({
      where: {
        date: new Date(date),
        hour: hour,
      },
    });

    // Calculate available slots (max 4 per hour)
    const bookedSlots = appointments.reduce(
      (total, appointment) => total + appointment.slots,
      0,
    );
    const maxSlots = 4;
    return maxSlots - bookedSlots; // Available slots
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

  async approveAppointment(appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        user: true, // Include user details (to get their phone number)
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found.');
    }

    if (appointment.isApproved) {
      throw new BadRequestException('Appointment is already approved.');
    }

    // Update appointment status
    await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { isApproved: true },
    });

    // Send an SMS to the user
    if (appointment.user.phoneNumber) {
      const message = `שלום ${appointment.user.fullName}, התור שלך לתאריך ${new Date(appointment.date).toLocaleDateString()} בשעה ${appointment.hour}:00 אושר בהצלחה!`;
      await this.twilioService.sendSms(appointment.user.phoneNumber, message);
    }

    return { message: 'Appointment approved and SMS sent.' };
  }
}
