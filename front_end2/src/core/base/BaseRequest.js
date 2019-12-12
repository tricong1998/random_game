import auth from './Authenticator';
import axios from 'axios';

export default class BaseRequest {
  constructor(url) {
    this.url = url ? url : `${process.env.VUE_APP_SERVER_HOST}:${process.env.VUE_APP_SERVER_PORT}`;
  }

  async post(api, params = {}) {
    const fullUrl = `${this.url}${api}`;
    const token = this._getToken();
    console.log(token)
    const newParams = Object.assign({ token }, params);
    console.log(newParams)
    try {
      const res = await axios.post(fullUrl, newParams);
      return res.data;    
    } catch (e) {
      if (e.status === 401) {        
        auth.removeAuth();
        window.app.$route.push({ name: 'Login' });
        throw new Error(`Session Login Expired`);
      }
    }
  }

  async playerPost(api, params = {}) {
    const fullUrl = `${this.url}${api}`;
    console.log(params);
    try {
      const res = await axios.post(fullUrl, params);
      return res.data;    
    } catch (e) {
      if (e.status === 401) {     
        throw new Error(`Session Login Expired`);
      }
    }
  }

  async get(api, params = {}) {
    const fullUrl = `${this.url}${api}`;
    console.log(fullUrl);
    console.log(params)
    const newParams = Object.assign({}, params);
    try {
      const res = await axios.get(fullUrl, { params: newParams });
      return res.data;    
    } catch (e) {
      if (e.status === 401) {        
        auth.removeAuth();
        window.app.$route.push({ name: 'Login' });
        throw new Error(`Session Login Expired`);
      }
      throw new Error(e.Error ? e.Error: e);
    }
  }  

  _getToken() {
    return auth.getToken();
  }

}