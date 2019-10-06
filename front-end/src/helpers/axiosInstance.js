import axios from 'axios';
import { MindCloudConfig } from 'configurations';

const baseURL = MindCloudConfig.mindCloudServer || (process.env.REACT_APP_BASE_URL + '/api/');

export const axiosInstance = axios.create({
  baseURL,
});
