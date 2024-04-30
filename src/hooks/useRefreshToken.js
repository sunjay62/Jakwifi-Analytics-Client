import useAuth from './useAuth';
import axios from '../api/axios';

const useRefreshToken = () => {
  const { setAuth } = useAuth();
  const refresh = async () => {
    const refreshToken = localStorage.getItem('refresh_token');

    const response = await axios.post('/admin/@refresh_token', {
      refresh_token: refreshToken
    });
    setAuth((prev) => {
      // console.log(JSON.stringify(prev));
      // console.log(response.data.access_token);
      return { ...prev, access_token: response.data.access_token };
    });
    return response.data.access_token;
  };
  return refresh;
};

export default useRefreshToken;
