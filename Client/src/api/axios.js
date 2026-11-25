import axios from 'axios'

const rawBaseUrl = import.meta.env.VITE_BASEURL || 'http://localhost:4000'
const baseURL = rawBaseUrl.replace(/\/+$/, '')

const api = axios.create({
    baseURL
})

// Automatically retry requests that fail with 503 (serverless database cold start)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config
        if (config && error.response && error.response.status === 503) {
            config.__retryCount = config.__retryCount || 0
            if (config.__retryCount < 2) {
                config.__retryCount += 1
                // Wait 1.5s for serverless cold start to establish MongoDB connection
                await new Promise((resolve) => setTimeout(resolve, 1500))
                return api(config)
            }
        }
        return Promise.reject(error)
    }
)

export default api
