const jwt = require('jsonwebtoken');
require('dotenv').config();

const token = jwt.sign({ id: '6a917ce6aa34983660df3844', role: 'student' }, process.env.JWT_SECRET, { expiresIn: '1h' });
console.log(token);
