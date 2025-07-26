import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, body: emailBody, sender } = body;

    // Validate required fields
    if (!to || !subject || !emailBody || !sender?.name || !sender?.contact) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create a transporter using Gmail SMTP
    // You'll need to set up App Password in your Gmail account
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, // Your Gmail address
        pass: process.env.GMAIL_APP_PASSWORD, // Your App Password (not regular password)
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: to,
      subject: subject,
      text: emailBody,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            New Message from Portfolio Contact Form
          </h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #007bff; margin-top: 0;">Sender Information:</h3>
            <p><strong>Name:</strong> ${sender.name}</p>
            <p><strong>${sender.contactType === 'email' ? 'Email' : 'Phone'}:</strong> ${sender.contact}</p>
            <p><strong>Sent:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <div style="background-color: #fff; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px;">
            <h3 style="color: #333; margin-top: 0;">Message:</h3>
            <div style="white-space: pre-wrap; line-height: 1.6;">${emailBody}</div>
          </div>
          <div style="margin-top: 20px; padding: 15px; background-color: #e7f3ff; border-radius: 8px; border-left: 4px solid #007bff;">
            <p style="margin: 0; font-size: 14px; color: #666;">
              This email was sent from your portfolio contact form. 
              Please reply directly to the sender using their provided contact information.
            </p>
          </div>
        </div>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
