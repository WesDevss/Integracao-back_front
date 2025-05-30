// services/api.js
import axios from 'axios';

// Use a variável global definida no vite.config.ts
const baseURL = __BACKEND_BASE_URL__;

const api = axios.create({
  baseURL: baseURL,
  timeout: 10000, // timeout de 10 segundos
  // Remover o header Content-Type padrão. Axios cuidará disso para FormData.
  // headers: {
  //   'Content-Type': 'application/json',
  // }
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Erro do servidor
      console.error('Erro na resposta:', error.response.data);
    } else if (error.request) {
      // Erro na requisição
      console.error('Erro na requisição:', error.request);
    } else {
      // Erro na configuração da requisição
      console.error('Erro:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;

