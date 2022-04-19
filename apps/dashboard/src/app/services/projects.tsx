import axios from 'axios';
import { environment } from '../../environments/environment';

const baseUrl = environment.apiHost;

const getProjects = async (lastKey = null, limit = 100) => {
  const response = await axios.get(`${baseUrl}/projects`, {
    params: { limit: limit, lastKey: lastKey },
  });
  return response;
};

export const getAllProjects = async () => {
  let result: any[] = [];
  let cur = await getProjects();
  while (cur.data != null && cur.data.length !== 0) {
    result = result.concat(cur.data);
    cur = await getProjects(result[result.length - 1].id);
  }
  return result;
};

export const getProjectById = async (id: string) => {
  const response = await axios.get(
    `${baseUrl}/projects/${encodeURIComponent(id)}`
  );
  return response;
};

const getProjectDependencies = async (
  projectId: string,
  lastKey = null,
  limit = 100
) => {
  const response = await axios.get(
    `${baseUrl}/projects/${encodeURIComponent(projectId)}/packages`,
    {
      params: { limit: limit, lastKey: lastKey },
    }
  );
  return response;
};

export const getAllProjectDependencies = async (projectId: string) => {
  let result: any[] = [];
  let cur = await getProjectDependencies(projectId);
  while (cur.data.packages != null && cur.data.packages.length !== 0) {
    result = result.concat(cur.data.packages);
    cur = await getProjectDependencies(projectId, result[result.length - 1].id);
  }
  return result;
};
