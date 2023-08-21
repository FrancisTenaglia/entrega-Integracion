import nodemailer from 'nodemailer';
import encryptQueryParam from './queryParamsEncryption.js';

const transport = nodemailer.createTransport({service:'gmail', port:3000, auth:'yourEmail@gmail.com', pass:'youremail_password'});

export const sendRecoverEmail = async(userEmail, baseUrl, userId) => {const linkDurationMinutes = 60; const expiration = new Date().getTime() + linkDurationMinutes*60*1000;

const encryptedExpiration = encryptQueryParam(expiration.toString());

const encryptedUserId = encryptQueryParam(userId.toString());

const recoveryUrl =` ${baseUrl}/passwordreset?uid=${encryptedUserId}&et=${encryptedExpiration}`;

await transport.sendMail({ from: 'Your Name yourEmail@gmail.com', to: userEmail, subject:'Password Recovery', html: '<h1>Password Recovery</h1> <p>Click <a href="${recoveryUrl}">here</a> to reset your password.</p> <p>The link will be available for 1 hour only.</p>'});
};