import axios from 'axios';
import { environment } from '../../environments/environment';

const baseUrl = environment.apiHost;

export const getVulns = async () => {
  const response = await axios.get(`${baseUrl}/vulns`);
  return response;
};

export const getVulnById = async (id: string) => {
  const response = await axios.get(`${baseUrl}/vulns/${id}`);
  return response;
};
