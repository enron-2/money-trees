import axios from 'axios';
import { environment } from '../../environments/environment';

const baseUrl = environment.apiHost;

export const getPackages = async (lastKey = null, limit = 100) => {
  const response = await axios.get(`${baseUrl}/packages`, {
    params: { limit: limit, lastKey: lastKey },
  });
  return response;
};

export const getAllPackages = async () => {
  let result: any[] = [];
  let cur = await getPackages();
  while (cur.data != null && cur.data.length !== 0) {
    result = result.concat(cur.data);
    cur = await getPackages(result[result.length - 1].id);
  }
  return result;
};

export const getPackageById = async (id: string) => {
  const response = await axios.get(
    `${baseUrl}/packages/${encodeURIComponent(id)}`
  );
  return response;
};

const getPackageVulns = async (
  packageId: string,
  lastKey = null,
  limit = 100
) => {
  const response = await axios.get(
    `${baseUrl}/packages/${encodeURIComponent(packageId)}/vulns`,
    {
      params: { limit: limit, lastKey: lastKey },
    }
  );
  return response;
};

export const getAllPackageVulns = async (packageId: string) => {
  let result: any[] = [];
  let cur = await getPackageVulns(packageId);
  while (cur.data.vulns != null && cur.data.vulns.length !== 0) {
    result = result.concat(cur.data.vulns);
    cur = await getPackageVulns(packageId, result[result.length - 1].id);
  }
  return result;
};

const getPackageProjects = async (
  packageId: string,
  lastKey = null,
  limit = 100
) => {
  const response = await axios.get(
    `${baseUrl}/packages/${encodeURIComponent(packageId)}/projects`,
    { params: { limit: limit, lastKey: lastKey } }
  );
  return response;
};

export const getAllPackageProjects = async (packageId: string) => {
  let result: any[] = [];
  let cur = await getPackageProjects(packageId);
  while (cur.data != null && cur.data.length !== 0) {
    result = result.concat(cur.data);
    cur = await getPackageProjects(packageId, result[result.length - 1].id);
  }
  return result;
};
