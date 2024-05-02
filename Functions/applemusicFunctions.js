// generateAppleMusicToken.js
import fs from 'fs';
import jwt from 'jsonwebtoken';

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

// Save the token to a config file
fs.writeFileSync('../Config/applemusicConfig.json', JSON.stringify({ developerToken: token }));

console.log('Developer token generated and saved successfully.');
