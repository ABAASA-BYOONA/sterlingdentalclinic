// server.js
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/send-appointment', async (req, res) => {
  const { user_name, user_phone, user_email, service, appointment_date, message } = req.body;

  if (!user_name || !user_phone || !service || !appointment_date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const mailOptions = {
    from: `"Appointment Request" <${process.env.SMTP_USER}>`,
    to: 'lostemoji9@gmail.com',
    subject: 'New Appointment Request',
    html: `
      <h3>New Appointment Request</h3>
      <p><strong>Name:</strong> ${user_name}</p>
      <p><strong>Phone:</strong> ${user_phone}</p>
      <p><strong>Email:</strong> ${user_email || 'N/A'}</p>
      <p><strong>Service:</strong> ${service}</p>
      <p><strong>Date:</strong> ${appointment_date}</p>
      <p><strong>Additional Info:</strong> ${message || 'None'}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Appointment request sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send appointment request' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));