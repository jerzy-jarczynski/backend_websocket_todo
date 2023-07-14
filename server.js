const express = require('express');
const socket = require('socket.io');
const path = require('path');

const app = express();

const tasks = [];

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '/client/build')));

app.use((req, res) => {
  res.status(404).send({ message: 'Not found...' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/build/index.html'));
});

const server = app.listen(process.env.PORT || 8000, () => {
  console.log('Server is running...');
});

const io = socket(server);

io.on('connection', (socket) => {
  console.log('New client! Its id – ' + socket.id);
  io.to(socket.id).emit('updateData', tasks);
  socket.on('addTask', (task) => {
    console.log('addTask received from ' + socket.id);
    tasks.push({ id: task.id, name: task.name });
    console.log(tasks);
    socket.broadcast.emit('addTask', task);
  });
  socket.on('removeTask', (taskId) => {
    console.log('removeTask received form ' + socket.id);
    const index = tasks.findIndex(item => item.id === taskId.taskId);
    if (index !== -1) {      
      tasks.splice(index, 1);
      console.log(tasks);
      socket.broadcast.emit('removeTask', taskId.taskId);
    }
  });
  socket.on('modifyTask', (updatedTasks) => {
    tasks.splice(0, tasks.length, ...updatedTasks);
    console.log(tasks);
    socket.broadcast.emit('modifyTask', tasks);
  })
});

// test comment