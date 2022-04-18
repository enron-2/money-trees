import axios from 'axios';

export const isDependabotEnabled = async (repo: string) => {
  const apiUrl = `https://api.github.com/repos/${repo}/contents/.github/dependabot.yml`;
  try {
    await axios.get(apiUrl);
    return true;
  } catch (err: any) {
    if (err.response.status === 404) {
      return false;
    } else {
      console.log(err);
      throw new Error('Unabled to check if dependabot is enabled');
    }
  }
};

export const getDependabotPR = async (repo: string, packageName: string) => {
  const searchUrl = 'https://api.github.com/search/issues';
  const searchQuery = `?q=is:open+repo:${repo}+${packageName}+in:title`;
  const response = await axios.get(searchUrl + searchQuery);
  const result: any = {};
  if (response.data.total_count === 0) {
    result.found = false;
  } else {
    result.found = true;
    result.url = response.data.items[0].html_url;
  }
  return result;
};
