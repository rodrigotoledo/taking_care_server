const emailService = require('./emailService');
const smsService = require('./smsService');
const pushService = require('./pushService');
const { Appointment, Patient, Doctor } = require('../models');

module.exports = {
  /**
   * Envia notificação baseada no tipo
   * @param {Object} params - { type, appointmentId, reason? }
   */
  async sendNotification({ type, appointmentId, reason = null }) {
    try {
      const appointment = await Appointment.findByPk(appointmentId, {
        include: [
          { model: Patient, as: 'patient' },
          { model: Doctor, as: 'doctor' }
        ]
      });

      if (!appointment) throw new Error('Appointment not found');

      switch (type) {
        case 'APPOINTMENT_CREATED':
          await this._sendAppointmentCreated(appointment);
          break;

        case 'APPOINTMENT_CANCELED':
          await this._sendAppointmentCanceled(appointment, reason);
          break;

        case 'REMINDER_24H':
          await this._sendReminder(appointment);
          break;

        default:
          throw new Error('Notification type not implemented');
      }

      return { success: true };
    } catch (error) {
      console.error('Notification failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Métodos privados
  async _sendAppointmentCreated(appointment) {
    const { patient, doctor } = appointment;

    // Envia para o paciente
    await emailService.send({
      to: patient.email,
      subject: 'Consulta agendada',
      html: `Você tem uma consulta com Dr. ${doctor.name} em ${appointment.date}`
    });

    // Envia para o médico
    await pushService.send({
      userId: doctor.id,
      title: 'Nova consulta',
      body: `Paciente ${patient.name} agendou para ${appointment.date}`
    });
  },

  async _sendAppointmentCanceled(appointment, reason) {
    const { patient, doctor } = appointment;

    // SMS para o paciente
    await smsService.send({
      phone: patient.phone,
      message: `Sua consulta foi cancelada. Motivo: ${reason || 'não informado'}`
    });

    // Email para o médico
    await emailService.send({
      to: doctor.email,
      subject: 'Consulta cancelada',
      html: `A consulta com ${patient.name} foi cancelada. Motivo: ${reason}`
    });
  },

  async _sendReminder(appointment) {
    // Implementação similar...
  }
};
