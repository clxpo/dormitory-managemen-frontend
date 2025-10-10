import axios from 'axios'

const api = axios.create({
  // baseURL: 'https://dormitory-management-backend-4b6o.onrender.com/api',
  baseURL: 'http://localhost:3000/api'
})

export default api
