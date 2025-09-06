/**
 * Generates the HTML content for an OTP verification email.
 * @returns {string} The complete HTML structure for the email.
 */
const otpTemplate = (otp) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>OTP Verification</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                padding-bottom: 20px;
            }
            .header h1 {
                margin: 0;
                color: #333333;
            }
            .content {
                text-align: center;
            }
            .content p {
                color: #555555;
                line-height: 1.6;
            }
            .otp-code {
                display: inline-block;
                font-size: 24px;
                color: #333333;
                background-color: #f0f0f0;
                padding: 10px 20px;
                border-radius: 4px;
                letter-spacing: 2px;
                margin: 20px 0;
            }
            .footer {
                text-align: center;
                padding-top: 20px;
                font-size: 12px;
                color: #999999;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>OTP Verification</h1>
            </div>
            <div class="content">
                <p>Your One-Time Password (OTP) for verification is:</p>
                <div class="otp-code">${otp}</div>
                <p>This OTP is valid for 2 minutes. Please do not share it with anyone.</p>
            </div>
            <div class="footer">
                <p>&copy; 2025 Coursify. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = otpTemplate;
