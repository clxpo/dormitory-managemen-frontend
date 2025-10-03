import axios from 'axios'

const api = axios.create({
  baseURL: 'https://dormitory-management-backend-4b6o.onrender.com/api'
})

export default api
