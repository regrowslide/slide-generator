import {basePath} from 'src/cm/lib/methods/common'
import axios from 'axios'
axios.defaults.headers.common['Authorization'] = process.env.BETTER_AUTH_SECRET
axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*'
axios.defaults.baseURL = basePath
axios.defaults.headers.post['Content-Type'] = 'application/json'
const Axios = axios
export default Axios
