import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (to, subject, body) => {
    let recipient = to;
    let mailSubject = subject;
    let mailHtml = body;

    // Support both sendEmail(to, subject, body) and sendEmail({ to, subject, body })
    if (typeof to === 'object' && to !== null) {
        recipient = to.to;
        mailSubject = to.subject;
        mailHtml = to.body || to.html;
    }

    if (!recipient) {
        console.warn('sendEmail skipped: recipient is missing');
        return null;
    }

    const response = await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to: recipient, 
        subject: mailSubject,
        html: mailHtml,
    });
    return response;
}

export default sendEmail;