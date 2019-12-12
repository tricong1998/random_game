import Const from '../base/Const';
import BaseRequest from '../base/BaseRequest';

class PlayerRequest extends BaseRequest {
  async join ({ account, privateKey, gameId }) {
    const res = await this.playerPost(Const.joinUrl, { account, privateKey, gameId });
    console.log(res);
    console.log(res.token);
    console.log(res.token.token);
    if (res) {
      if (res.token) {
        const data = res.token;
        const storedUser = localStorage.getItem(Const.playerKeyLocalStorage);
        if (storedUser) {
          localStorage.removeItem(Const.playerKeyLocalStorage);
        }
        localStorage.setItem(Const.playerKeyLocalStorage, JSON.stringify(data));
      } else {
        throw new Error(res.token)
      }
    }
    return res.playerId;
  }

  async cancel ({ gameId }) {
    return await this.post(Const.cancelUrl, { gameId });
  }

  async commit ({ account, playerId, secret }) {
    let data = localStorage.getItem(Const.playerKeyLocalStorage);
    let token = null;
    try {
      data = JSON.parse(data);        
      token = data.token;
    } catch (e) {
      console.error(`Invalid stored user: ${data}`);
      localStorage.removeItem(Const.playerKeyLocalStorage);
    }    
    if (!token) {
      throw new Error(`Require joined`);
    }
    console.log(token)
    const res = await this.playerPost(Const.commitUrl, { account, playerId, secret, token });
    return res;
  }  
}

const adminRequest = new PlayerRequest();
export default adminRequest;