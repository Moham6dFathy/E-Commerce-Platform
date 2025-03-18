const nodemailer = require('nodemailer');

class Email {
  constructor(user, url, order) {
    (this.from = 'moham6dfathy@gmail.com'),
      (this.to = user.email),
      (this.name = user.name),
      (this.url = url || 0),
      (this.order = order || 0);
  }

  createTransporter() {
    //Production
    if (process.env.NODE_ENV === 'production') {
      ({
        service: 'sendgrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    //Development
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
  async sendOrderdetails() {
    await this.send(
      `The Order ${this.order._id.toString()} is been done `,
      'The order is in processing you will recive message if it is deliverd'
    );
  }

  async sendVerifcationEmailUrl() {
    await this.send(
      `Verify the email Matjar  Platform`,
      `this is the Url of verifcation of an email ${this.url} <Expire in an one hour>`
    );
  }
}

module.exports = Email;
