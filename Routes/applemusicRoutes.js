import express from 'express';
//import { generateAppleMusicToken } from '../Functions/applemusicFunctions.js';

const router = express.Router(); // Create a router object

// Route to handle Apple Music authorization
router.get('/login', async (req, res) => {
    try {
      // Generate Apple Music token
      console.log("login started");
      // Here you can redirect the user to the Apple Music authorization URL or handle the token as needed
      //res.send(token); // For demonstration purposes, sending the generated token as response
    } catch (error) {
      console.error('Error generating Apple Music token:', error);
      res.status(500).send('Error generating Apple Music token');
    }
  });
export default router;
