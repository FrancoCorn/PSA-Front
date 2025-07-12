import axios from 'axios';


const supportApi = axios.create({
  baseURL: 'http://localhost:8080',
});

const projectApi = axios.create({
  baseURL: 'https://moduloproyecto.onrender.com',
});

export {supportApi, projectApi};