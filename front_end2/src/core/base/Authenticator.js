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
    if (storedUser) {
      try {
        this._user = JSON.parse(storedUser);
      } catch (e) {
        console.error(`Invalid stored user: ${storedUser}`);
        localStorage.removeItem(Const.userKeyLocalStorage);
        this._user = null;
      }
    }
  }

  async login({ username, password }) {
    console.log('auth')
    if (!username || !password) {
      //TODO dangerous alert
      // throw new Error(`Invalid username or password!`)
    }
    const url = `${process.env.VUE_APP_SERVER_HOST}:${process.env.VUE_APP_SERVER_PORT}${Const.loginUrl}`;
    console.log(url);
    try {
      const result = await axios.post(url, { username, password });
      localStorage.setItem(Const.userKeyLocalStorage, result);
      return result;      
    } catch (e) {
      throw new Error(e.Error ? e.Error : e);
      //TODO dangerous alert      
    }
  }
}

const auth = new Authenticator();
Vue.prototype.$auth = auth;
export default auth;