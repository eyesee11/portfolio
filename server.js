const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for development
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT || 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.'
    }
});

app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '.')));

// Email transporter configuration
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

// Email validation function
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                error: 'All fields are required',
                details: 'Please fill in all required fields: name, email, subject, and message.'
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({
                error: 'Invalid email format',
                details: 'Please provide a valid email address.'
            });
        }

        if (name.length < 2 || name.length > 100) {
            return res.status(400).json({
                error: 'Invalid name length',
                details: 'Name must be between 2 and 100 characters.'
            });
        }

        if (subject.length < 5 || subject.length > 200) {
            return res.status(400).json({
                error: 'Invalid subject length',
                details: 'Subject must be between 5 and 200 characters.'
            });
        }

        if (message.length < 10 || message.length > 2000) {
            return res.status(400).json({
                error: 'Invalid message length',
                details: 'Message must be between 10 and 2000 characters.'
            });
        }

        // Create transporter
        const transporter = createTransporter();

        // Verify transporter configuration
        await transporter.verify();

        // Email content
        const mailOptions = {
            from: `"Portfolio Contact Form" <${process.env.EMAIL_FROM}>`,
            to: process.env.EMAIL_TO,
            subject: `Portfolio Contact: ${subject}`,
            html: `
                <div style="font-family: 'Space Grotesk', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
                    <div style="background-color: white; padding: 30px; border: 3px solid #000; box-shadow: 6px 6px 0 #000;">
                        <h2 style="color: #000; margin-top: 0; border-bottom: 3px solid #ff6b35; padding-bottom: 10px;">
                            New Contact Form Submission
                        </h2>
                        
                        <div style="margin: 20px 0;">
                            <h3 style="color: #333; margin-bottom: 5px;">From:</h3>
                            <p style="margin: 0; padding: 10px; background-color: #f9f9f9; border-left: 4px solid #ff6b35;">
                                <strong>${name}</strong><br>
                                <a href="mailto:${email}" style="color: #ff6b35; text-decoration: none;">${email}</a>
                            </p>
                        </div>
                        
                        <div style="margin: 20px 0;">
                            <h3 style="color: #333; margin-bottom: 5px;">Subject:</h3>
                            <p style="margin: 0; padding: 10px; background-color: #f9f9f9; border-left: 4px solid #ff6b35;">
                                ${subject}
                            </p>
                        </div>
                        
                        <div style="margin: 20px 0;">
                            <h3 style="color: #333; margin-bottom: 5px;">Message:</h3>
                            <div style="padding: 15px; background-color: #f9f9f9; border-left: 4px solid #ff6b35; white-space: pre-wrap;">
                                ${message}
                            </div>
                        </div>
                        
                        <hr style="border: none; border-top: 2px solid #eee; margin: 30px 0;">
                        
                        <p style="color: #666; font-size: 12px; margin: 0;">
                            This message was sent from your portfolio contact form.<br>
                            Timestamp: ${new Date().toLocaleString()}
                        </p>
                    </div>
                </div>
            `,
            text: `
Portfolio Contact Form Submission

From: ${name} (${email})
Subject: ${subject}

Message:
${message}

Timestamp: ${new Date().toLocaleString()}
            `
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);

        console.log('Email sent successfully:', info.messageId);

        res.status(200).json({
            success: true,
            message: 'Email sent successfully!',
            messageId: info.messageId
        });

    } catch (error) {
        console.error('Email sending error:', error);

        // Handle specific nodemailer errors
        if (error.code === 'EAUTH') {
            return res.status(500).json({
                error: 'Email authentication failed',
                details: 'Please check your email credentials in the environment variables.'
            });
        }

        if (error.code === 'ENOTFOUND' || error.code === 'ECONNECTION') {
            return res.status(500).json({
                error: 'Email server connection failed',
                details: 'Unable to connect to the email server. Please try again later.'
            });
        }

        res.status(500).json({
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later.'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested endpoint does not exist.'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong.'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Portfolio server running on port ${PORT}`);
    console.log(`📧 Email service: ${process.env.EMAIL_HOST || 'Not configured'}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;