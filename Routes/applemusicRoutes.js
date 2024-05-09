import express from 'express';
import fs from 'fs';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.get('/token', async (req, res) => {
    try {
      const privateKeyPath = '/workspaces/RythmicLink/Config/AuthKey_HAJGY4D7XJ.p8';
      const privateKey = fs.readFileSync(privateKeyPath).toString();
      const teamId = 'Y66P828V8L';
      const keyId = 'HAJGY4D7XJ';
      const token = jwt.sign({}, privateKey, {
        algorithm: 'ES256',
        expiresIn: '180d',
        issuer: teamId,
        header: {
          alg: 'ES256',
          kid: keyId,
        },
      });
        console.log('1Apple Music token generated:', token);
        res.json({ token });
    } catch (error) {
        console.error('Error generating Apple Music token:', error);
        res.status(500).send('Error generating Apple Music token');
    }
});

router.get('/login', async (req, res) => {
    music.authorize().then(musicUserToken => {
      console.log(`Authorized, music-user-token: ${musicUserToken}`);
    });
  });


export default router;
