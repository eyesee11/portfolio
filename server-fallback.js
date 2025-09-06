// Alternative email solution using EmailJS or form submission service
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false,
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.RATE_LIMIT || 100,
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

// Email validation function
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Simple file-based email logging system (fallback)
const logEmailToFile = (formData) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        ...formData,
        id: timestamp.replace(/[:.]/g, '-') + '-' + Math.random().toString(36).substr(2, 9)
    };

    const logsDir = path.join(__dirname, 'email-logs');
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir);
    }

    const logFile = path.join(logsDir, `contact-${new Date().toISOString().split('T')[0]}.json`);
    
    let logs = [];
    if (fs.existsSync(logFile)) {
        try {
            logs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
        } catch (e) {
            logs = [];
        }
    }
    
    logs.push(logEntry);
    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
    
    return logEntry.id;
};

// Contact form endpoint with fallback logging
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

        // Log the form submission to file (as backup)
        const logId = logEmailToFile({ name, email, subject, message });

        // Try to send email (but don't fail if it doesn't work)
        let emailSent = false;
        let emailError = null;

        try {
            const nodemailer = require('nodemailer');
            
            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.EMAIL_PORT) || 587,
                secure: process.env.EMAIL_SECURE === 'true',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            const mailOptions = {
                from: `"Portfolio Contact Form" <${process.env.EMAIL_FROM}>`,
                to: process.env.EMAIL_TO,
                subject: `Portfolio Contact: ${subject}`,
                html: `
                    <div style="font-family: 'Space Grotesk', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #000; margin-top: 0; border-bottom: 3px solid #ff6b35; padding-bottom: 10px;">
                            New Contact Form Submission
                        </h2>
                        
                        <div style="margin: 20px 0;">
                            <h3>From:</h3>
                            <p><strong>${name}</strong><br>
                            <a href="mailto:${email}">${email}</a></p>
                        </div>
                        
                        <div style="margin: 20px 0;">
                            <h3>Subject:</h3>
                            <p>${subject}</p>
                        </div>
                        
                        <div style="margin: 20px 0;">
                            <h3>Message:</h3>
                            <div style="padding: 15px; background-color: #f9f9f9; border-left: 4px solid #ff6b35;">
                                ${message.replace(/\n/g, '<br>')}
                            </div>
                        </div>
                        
                        <hr>
                        <p style="color: #666; font-size: 12px;">
                            Log ID: ${logId}<br>
                            Timestamp: ${new Date().toLocaleString()}
                        </p>
                    </div>
                `,
                text: `Portfolio Contact Form\n\nFrom: ${name} (${email})\nSubject: ${subject}\n\nMessage:\n${message}\n\nLog ID: ${logId}\nTimestamp: ${new Date().toLocaleString()}`
            };

            await transporter.verify();
            const info = await transporter.sendMail(mailOptions);
            emailSent = true;
            
            console.log('✅ Email sent successfully:', info.messageId);

        } catch (error) {
            emailError = error.message;
            console.log('📄 Email failed, but form data saved to file:', logId);
            console.log('📧 Email error:', error.message);
        }

        // Always return success since we logged the form data
        res.status(200).json({
            success: true,
            message: emailSent 
                ? 'Email sent successfully!' 
                : 'Form submitted successfully! Your message has been logged and will be processed.',
            logId: logId,
            emailSent: emailSent,
            emailError: emailSent ? null : 'Email delivery failed, but your message was saved successfully.'
        });

    } catch (error) {
        console.error('Form processing error:', error);

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
        environment: process.env.NODE_ENV || 'development',
        emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
    });
});

// Endpoint to view logged emails (for development)
app.get('/api/emails', (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
        return res.status(403).json({ error: 'Access denied' });
    }

    const logsDir = path.join(__dirname, 'email-logs');
    if (!fs.existsSync(logsDir)) {
        return res.json({ emails: [] });
    }

    try {
        const files = fs.readdirSync(logsDir);
        let allEmails = [];

        files.forEach(file => {
            if (file.endsWith('.json')) {
                const filePath = path.join(logsDir, file);
                const logs = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                allEmails = allEmails.concat(logs);
            }
        });

        allEmails.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json({
            emails: allEmails.slice(0, 50), // Return last 50 emails
            total: allEmails.length
        });

    } catch (error) {
        res.status(500).json({ error: 'Failed to read email logs' });
    }
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
    console.log(`📄 Fallback logging: Enabled (email-logs/ directory)`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔍 View logs: http://localhost:${PORT}/api/emails (dev only)`);
});

module.exports = app;
