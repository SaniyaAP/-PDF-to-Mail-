import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';  // To load environment variables securely
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = 3001;

// Enable CORS for all origins
app.use(cors());

// Middleware to handle multipart/form-data (for file uploads)
const storage = multer.memoryStorage(); // We will use memory storage to avoid saving files on disk
const upload = multer({ storage }).single('pdf'); // 'pdf' is the name of the form field

// Nodemailer transport setup using credentials from environment variables
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,  // Sender email from environment variables
        pass: process.env.EMAIL_PASS,  // Sender email password from environment variables
    },
});

// Handle POST request for sending email with PDF attachment
app.post('/send-email', upload, (req, res) => {
    // Ensure we have the PDF in the request
    if (!req.file) {
        return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    // Set up the email options
    const mailOptions = {
        from: process.env.EMAIL_USER,  // Sender email
        to: 'patilsandesh2311@gmail.com',  // Receiver email
        subject: 'Bill Format',  // Subject of the email
        text: 'Here is the bill in PDF format you requested.',  // Body text
        attachments: [
            {
                filename: 'bill.pdf',
                content: req.file.buffer,  // Attach the PDF file buffer
                contentType: 'application/pdf',
            },
        ],
    };

    // Send the email with the PDF attachment
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ error: `Failed to send email: ${error.message}` });
        }

        console.log('Email sent successfully:', info);
        res.status(200).json({ message: 'Email sent successfully', info });
    });
});

// Handle 404 errors for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
