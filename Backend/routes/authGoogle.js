const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const { User, Admin } = require('../database/db');
const { generateTokens } = require('../utils/token');

// Will use process.env.GOOGLE_CLIENT_ID or a dummy one if not set for now
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy-client-id');

router.post('/', async (req, res) => {
    const { token, role, username } = req.body; // role: 'user' or 'admin'
    
    if (!token) {
        return res.status(400).json({ message: 'No token provided' });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID || 'dummy-client-id',
        });
        const payload = ticket.getPayload();
        const { sub, email, name } = payload;
        
        const Model = role === 'admin' ? Admin : User;
        
        let user = await Model.findOne({ email });
        
        if (!user) {
            if (!username) {
                return res.status(202).json({ 
                    requiresUsername: true, 
                    message: 'Please choose a username to complete registration.',
                    token // Return token so frontend can submit it again
                });
            }

            // Create user
            user = await Model.create({
                googleId: sub,
                email: email,
                username: username,
            });
        } else if (!user.googleId) {
            user.googleId = sub;
            await user.save();
        }
        
        const { accessToken, refreshToken } = generateTokens(user);
        user.refreshToken = refreshToken;
        await user.save();
        
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 30 * 24 * 60 * 60 * 1000 });
        res.status(200).json({ accessToken, role, message: 'Google Login Successful' });
    } catch (err) {
        console.error("Google Auth Error: ", err);
        res.status(401).json({ message: 'Invalid Google Token' });
    }
});

module.exports = router;
