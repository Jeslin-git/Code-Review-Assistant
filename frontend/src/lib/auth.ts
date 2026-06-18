
export const getToken = () => localStorage.getItem('token');

export const isLoggedIn = () => !!getToken();


export const saveToken = (token: string) => {
  localStorage.setItem('token', token);
  document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;
};

export const clearToken = () => {
  localStorage.removeItem('token');
  document.cookie = 'token=; path=/; max-age=0';
};