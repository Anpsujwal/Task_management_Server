const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/task');
const userRoutes = require('./routes/user');
const groupRoutes = require('./routes/groups');
const user1Routes=require('./routes/user1');
const ticketRoutes=require('./routes/ticket')
const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Allow these HTTP methods
    next();
  });


app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/user1',user1Routes);
app.use('/api/tickets',ticketRoutes)


app.listen(5000)

mongoose.connect("mongodb+srv://anpsujwal:dbpassword@cluster0.k5xrdmr.mongodb.net/employee_management?retryWrites=true&w=majority&appName=Cluster0")
.then(() =>console.log("connection successful"))
.catch((err) => console.log(err));
