const { ipcRenderer } = require('electron');

const socket = new WebSocket('ws://localhost:8080');

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  document.getElementById('distance1').innerText = `Distance 1: ${data.distance1} cm`;
  document.getElementById('distance2').innerText = `Distance 2: ${data.distance2} cm`;
};

document.getElementById('login-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  ipcRenderer.send('authenticate-user', username, password);
});

ipcRenderer.on('auth-response', (event, response) => {
  if (response.success) {
    document.getElementById('status').innerText = 'Login successful!';
  } else {
    document.getElementById('status').innerText = `Login failed: ${response.message}`;
  }
});

document.getElementById('register-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const username = document.getElementById('reg-username').value;
  const password = document.getElementById('reg-password').value;
  ipcRenderer.send('register-user', username, password);
});

ipcRenderer.on('register-response', (event, response) => {
  if (response.success) {
    document.getElementById('reg-status').innerText = 'Registration successful!';
  } else {
    document.getElementById('reg-status').innerText = `Registration failed: ${response.message}`;
  }
});
