const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const billRoutes = require('./routes/billRoutes');
const userRoutes = require('./routes/userRoutes');


const engine = require('ejs-mate');




const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));




app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.get('/', (req, res) => {
    res.send('Municipality Billing System');
});


app.use(authRoutes);

app.use(dashboardRoutes);

app.use(propertyRoutes);

app.use(billRoutes);

app.use(userRoutes);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});