import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { useState, useEffect } from 'react';

const App = () => {
  const [socket, setSocket] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');

  const updateTasks = (arr) => {
    console.log(arr);
    setTasks(tasks => [...tasks, ...arr]);
  };

  const addTask = (task) => {
    console.log(task);
    setTasks(tasks => [...tasks, task]);
  };

  const modifyTask = (task) => {
    const newName = prompt('Enter new task name:', task.name);

    if (newName) {
      const updatedTasks = tasks.map(t => {
        if (t.id === task.id) {
          return { ...t, name: newName };
        }
        return t;
      });
  
      setTasks(updatedTasks);
  
      if (socket) {
        socket.emit('modifyTask', updatedTasks);
      }
    }
  };

  const modifyTasks = (arr) => {
    setTasks(arr);
  };

  const removeTask = (id) => {
    console.log(id);
    setTasks(tasks => tasks.filter(task => task.id !== id));
    if (socket) {
      socket.emit('removeTask', { taskId: id });
    }
  };

  const submitForm = (e) => {
    e.preventDefault();
    console.log(taskName);
    const task = { id: uuidv4(), name: taskName };
    addTask(task);
    socket.emit('addTask', task);
    setTaskName('');
  };

  useEffect(() => {
    const socketInstance = io('http://localhost:8000/');
    setSocket(socketInstance);

    socketInstance.on('updateData', (data) => updateTasks(data));
    socketInstance.on('addTask', (task) => addTask(task));
    socketInstance.on('removeTask', (taskId) => removeTask(taskId));
    socketInstance.on('modifyTask', (data) => modifyTasks(data));

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <div className="App">
      <header>
        <h1>ToDoList.app</h1>
      </header>

      <section className="tasks-section" id="tasks-section">
        <h2>Tasks</h2>

        <ul className="tasks-section__list" id="tasks-list">
          {tasks.map((task) => (
            <li key={task.id} className="task">
              {task.name}
              <div className="btn-group">
                <button className="btn btn--green" onClick={() => modifyTask(task)}>
                  Edit
                </button>
                <button className="btn btn--red" onClick={() => removeTask(task.id)}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>

        <form id="add-task-form" onSubmit={(e) => submitForm(e)}>
          <input
            className="text-input"
            autoComplete="off"
            type="text"
            placeholder="Type your description"
            id="task-name"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
          />
          <button className="btn" type="submit">
            Add
          </button>
        </form>
      </section>
    </div>
  );
};

export default App;
