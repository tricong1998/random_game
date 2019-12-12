import _ from 'lodash';
import axios from 'axios';
import Vue from 'vue';
import Utils from './Utils';
import Const from './Const';

class Authenticator {
  constructor () {
    this._init();
  }

  _init() {
    this._user = null;
    const authToken = Utils.qs('access_token');
    if (authToken && authToken.length > 0) {
      if (window.G_USER) {
        this._user = window.G_USER;
      } else {
        this._user = {
          token: authToken,
        }
      }
      return this;
    }

    const storedUser = localStorage.getItem(Const.userKeyLocalStorage);
    const storedPlayer = localStorage.getItem(Const.playerKeyLocalStorage);

    if (storedUser) {
      try {
        this._user = JSON.parse(storedUser);
        if (this._user.isAmin) {
          throw new Error(`Login fail`);
        }
      } catch (e) {
        console.error(`Invalid stored user: ${storedUser}`);
        localStorage.removeItem(Const.userKeyLocalStorage);
        this._user = null;
      }
    }

    if (storedPlayer) {
      this._player = JSON.parse(storedUser);
    }
  }

  async login({ username, password }) {
    if (!username || !password) {
      //TODO dangerous alert
      // throw new Error(`Invalid username or password!`)
    }
    const url = `${process.env.VUE_APP_SERVER_HOST}:${process.env.VUE_APP_SERVER_PORT}${Const.loginUrl}`;
    try {
      const result = await axios.post(url, { username, password });
      const data = result.data;
      localStorage.setItem(Const.userKeyLocalStorage, JSON.stringify(data));
      this._user = data;
      return data;      
    } catch (e) {
      throw new Error(e.Error ? e.Error : e);
      //TODO dangerous alert      
    }
  }

  getToken() {
    const storedUser = localStorage.getItem(Const.userKeyLocalStorage);
    if (storedUser) {
      try {
        return JSON.parse(storedUser).token;
      } catch (e) {
        console.error(`Invalid stored user: ${storedUser}`);
        localStorage.removeItem(Const.userKeyLocalStorage);
        return null;
      }
    }
    return null;
  }

  removeAuth() {
    localStorage.removeItem(Const.userKeyLocalStorage);
    this._user = null;
    window.vueRouter.push({ name: 'Login' });
  }

  getPlayer() {
    let data = localStorage.getItem(Const.playerKeyLocalStorage);
    let token = null;
    try {
      data = JSON.parse(data);        
      token = data.token;
    } catch (e) {
      console.error(`Invalid stored user: ${data}`);
      localStorage.removeItem(Const.playerKeyLocalStorage);
    }        
    return token;
  }

  removePlayer() {
    localStorage.removeItem(Const.playerKeyLocalStorage);
    this._player = null;
  }

  setPlayer() {
    const data = localStorage.getItem(Const.playerKeyLocalStorage);
    try {
      this._player = JSON.parse(data);        
    } catch (e) {
      console.error(`Invalid stored user: ${data}`);
      localStorage.removeItem(Const.playerKeyLocalStorage);
    }          
  }
}

const auth = new Authenticator();
Vue.prototype.$auth = auth;
export default auth;