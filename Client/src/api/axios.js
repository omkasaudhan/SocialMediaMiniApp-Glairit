import axios from 'axios'

const rawBaseUrl = import.meta.env.VITE_BASEURL || 'http://localhost:4000'
const baseURL = rawBaseUrl.replace(/\/+$/, '')

const api = axios.create({
    baseURL
})

export default api
