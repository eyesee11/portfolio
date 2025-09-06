const nodemailer = require('nodemailer');

// Email validation function
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

exports.handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Health check endpoint
    if (event.path === '/api/health') {
        return {
            statusCode: 200,
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: 'OK',
                timestamp: new Date().toISOString(),
                platform: 'Netlify Functions',
                emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
            })
        };
    }

    // Contact form endpoint
    if (event.path === '/api/contact' && event.httpMethod === 'POST') {
        try {
            const { name, email, subject, message } = JSON.parse(event.body);

            // Validation
            if (!name || !email || !subject || !message) {
                return {
                    statusCode: 400,
                    headers: {
                        ...headers,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        error: 'All fields are required',
                        details: 'Please fill in all required fields: name, email, subject, and message.'
                    })
                };
            }

            if (!validateEmail(email)) {
                return {
                    statusCode: 400,
                    headers: {
                        ...headers,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        error: 'Invalid email format',
                        details: 'Please provide a valid email address.'
                    })
                };
            }

            if (name.length < 2 || name.length > 100) {
                return {
                    statusCode: 400,
                    headers: {
                        ...headers,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        error: 'Invalid name length',
                        details: 'Name must be between 2 and 100 characters.'
                    })
                };
            }

            if (subject.length < 5 || subject.length > 200) {
                return {
                    statusCode: 400,
                    headers: {
                        ...headers,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        error: 'Invalid subject length',
                        details: 'Subject must be between 5 and 200 characters.'
                    })
                };
            }

            if (message.length < 10 || message.length > 2000) {
                return {
                    statusCode: 400,
                    headers: {
                        ...headers,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        error: 'Invalid message length',
                        details: 'Message must be between 10 and 2000 characters.'
                    })
                };
            }

            // Generate a simple log ID for tracking
            const logId = new Date().toISOString().replace(/[:.]/g, '-') + '-' + Math.random().toString(36).substr(2, 9);

            // Try to send email (but don't fail if it doesn't work)
            let emailSent = false;
            let emailError = null;

            try {
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
                                Platform: Netlify Functions<br>
                                Log ID: ${logId}<br>
                                Timestamp: ${new Date().toLocaleString()}
                            </p>
                        </div>
                    `,
                    text: `Portfolio Contact Form (Netlify)\n\nFrom: ${name} (${email})\nSubject: ${subject}\n\nMessage:\n${message}\n\nLog ID: ${logId}\nTimestamp: ${new Date().toLocaleString()}`
                };

                await transporter.verify();
                const info = await transporter.sendMail(mailOptions);
                emailSent = true;
                
                console.log('✅ Email sent successfully:', info.messageId);

            } catch (error) {
                emailError = error.message;
                console.log('📧 Email error:', error.message);
            }

            // Always return success (even if email fails, we processed the form)
            return {
                statusCode: 200,
                headers: {
                    ...headers,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    success: true,
                    message: emailSent 
                        ? 'Email sent successfully!' 
                        : 'Form submitted successfully! Your message has been processed.',
                    logId: logId,
                    emailSent: emailSent,
                    platform: 'Netlify Functions',
                    emailError: emailSent ? null : 'Email delivery failed, but your message was processed successfully.'
                })
            };

        } catch (error) {
            console.error('Form processing error:', error);

            return {
                statusCode: 500,
                headers: {
                    ...headers,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    error: 'Internal server error',
                    details: 'Please try again later.',
                    platform: 'Netlify Functions'
                })
            };
        }
    }

    // Default 404 response
    return {
        statusCode: 404,
        headers: {
            ...headers,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            error: 'Not Found',
            message: 'The requested endpoint does not exist.',
            platform: 'Netlify Functions'
        })
    };
};
