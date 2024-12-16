const nodemailer = require('nodemailer');

class Email {
  constructor(user, url) {
    (this.from = '<Mohamed Fathy>mohamedfath@gmail.com'),
      (this.to = user.email),
      (this.name = user.name),
      (this.url = url);
  }

  createTransporter() {
    return nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      auth: {
        user: process.env.MAILTRAP_USERNAME,
        pass: process.env.MAILTRAP_PASSWORD,
      },
    });
  }

  async send(subject, text) {
    const mailOption = {
      from: this.from,
      to: this.to,
      subject,
      text,
    };

    await this.createTransporter().sendMail(mailOption);
  }

  async sendWelcome() {
    await this.send(
      'Welcome to in The Matjar Platform',
      'Welcome to in The Matjar Platform ,\n You will find all needs in this place. '
    );
  }
  async sendPasswordReset() {
    await this.send(
      'Reset Password (Invaild for 10 minutes)',
      `this is the Password Reset Url: ${this.url}`
    );
  }
}

module.exports = Email;
