

const express = require('express');
const bodyParser = require('body-parser');
const cors = require( 'cors' );
const { sequelize, User, Task } = require('./config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// const authenticateToken =  require("./Middleware/Auth");

const JWT_SECRET = '1234@#679';
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());


// Middleware to verify JWT token
function authenticateToken(req, res, next) {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Access denied' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};



app.get('/msg', async (req, res) => {

    res.send("Hello World From Server");
})


app.get('/getUser', authenticateToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ user : user });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});


////// User Authentication

// Signup Endpoint
app.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ username, email, password: hashedPassword });

        // Generate JWT token
        const token = jwt.sign({ userId: user.id }, JWT_SECRET);
        res.status(201).json({ user, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Login Endpoint
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new Error('User not found');
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            throw new Error('Invalid password');
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.id }, JWT_SECRET);
        res.status(200).json({ user, token });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});



/////Tasks crud APIs

// Protected route example
// get tasks by userId 
app.get('/tasks', authenticateToken, async (req, res) => {

    const userId = req.userId;
   
    try {
        const tasks = await Task.findAll({
            where: { userId }
        })
        res.status(200).json(tasks);
        // Your code to fetch tasks
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
});


//error
// creates a new task based on given userId 
app.post('/tasks', authenticateToken, async (req, res) => {
    const userId = req.userId;
    try {
        const { title, description } = req.body;
        const task = await Task.create({ userId, title, description });
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


// Update Task Endpoint
app.put('/tasks/:taskId', authenticateToken, async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const updates = req.body;
        const task = await Task.findByPk(taskId);
        if (!task) {
            throw new Error('Task not found');
        }
        await task.update(updates);
        res.status(200).json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete Task Endpoint
app.delete('/tasks/:taskId', authenticateToken , async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const task = await Task.findByPk(taskId);
        if (!task) {
            throw new Error('Task not found');
        }
        await task.destroy();
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// sequelize.sync().then(() => {
    // app.listen(PORT, () => {
    //     console.log(`Server is running on port ${PORT}`);
    // });
// }).catch(err => {
//     console.error('Error synchronizing models:', err);
// });
