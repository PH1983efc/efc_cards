const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const SECRET_KEY = 'your_secret_key'; // Replace with your actual secret key

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'JakeLeoEverton1983', // Replace with your actual database password
    database: 'efc_cards1'   // Replace with your actual database name
});

db.connect((err) => {
    if (err) throw err;
    console.log('Database connected!');
});

app.post('/register', async (req, res) => {
    const { Username, Password } = req.body;
    const hashedPassword = await bcrypt.hash(Password, 10);
    db.query('INSERT INTO users (Username, Password) VALUES (?, ?)', [Username, hashedPassword], (err, result) => {
        if (err) throw err;
        res.send('User registered!');
    });
});

app.post('/login', (req, res) => {
    const { Username, Password } = req.body;
    db.query('SELECT * FROM users WHERE Username = ?', [Username], async (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            const user = result[0];
            const match = await bcrypt.compare(Password, user.Password);
            if (match) {
                const token = jwt.sign({ userID: user.UserID }, SECRET_KEY, { expiresIn: '1h' });
                res.json({ token });
            } else {
                res.status(401).send('Invalid credentials');
            }
        } else {
            res.status(404).send('User not found');
        }
    });
});

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).send('Token is required');
    }
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.userID = decoded.userID;
    } catch (err) {
        return res.status(401).send('Invalid token');
    }
    next();
};

app.get('/cards', (req, res) => {
    db.query('SELECT * FROM efc_cards1', (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});

app.post('/cards', verifyToken, (req, res) => {
    const { Released, Brand, Card_Number, Information, Numbered, AutoPatch, First_Name, Last_Name, Collecting, Got, Front_Photo, Back_Photo } = req.body;
    db.query('INSERT INTO efc_cards1 (Released, Brand, Card_Number, Information, Numbered, AutoPatch, First_Name, Last_Name, Collecting, Got, Front_Photo, Back_Photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [Released, Brand, Card_Number, Information, Numbered, AutoPatch, First_Name, Last_Name, Collecting, Got, Front_Photo, Back_Photo], (err, result) => {
            if (err) throw err;
            res.send('Card added!');
        });
});

app.put('/cards/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const { Released, Brand, Card_Number, Information, Numbered, AutoPatch, First_Name, Last_Name, Collecting, Got, Front_Photo, Back_Photo } = req.body;
    db.query('UPDATE efc_cards1 SET Released = ?, Brand = ?, Card_Number = ?, Information = ?, Numbered = ?, AutoPatch = ?, First_Name = ?, Last_Name = ?, Collecting = ?, Got = ?, Front_Photo = ?, Back_Photo = ? WHERE CardID = ?',
        [Released, Brand, Card_Number, Information, Numbered, AutoPatch, First_Name, Last_Name, Collecting, Got, Front_Photo, Back_Photo, id], (err, result) => {
            if (err) throw err;
            res.send('Card updated!');
        });
});

app.delete('/cards/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM efc_cards1 WHERE CardID = ?', [id], (err, result) => {
        if (err) throw err;
        res.send('Card deleted!');
    });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
