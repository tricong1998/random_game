import Const from '../base/Const';
import BaseRequest from '../base/BaseRequest';

class ListRequest extends BaseRequest {

  async getAllGames(page) {
    const res = await this.get(Const.getGamesUrl, { page });
    return {games: res.result ? res.result : [], more: res.more};
  }

  async getOneGame({ gameId }) {
    const res = await this.get(Const.getOneGameUrl, { id: gameId });
    console.log(res.result)
    if (!res) {
      return {};
    } 
    return res.result;
  }

  async getPlayersGame({ gameId }) {
    const res = await this.get(Const.getPlayersGameUrl, { id: gameId });
    console.log(res.result)
    return res.result ? res.result : [];
  }

  async getOnePlayer({ playerId }) {
    const res = await this.get(Const.getOneplayerUrl, { id: playerId });
    console.log(res.result)
    if (!res) {
      return {};
    } 
    return res.result;
  }  

  async getBalance({ account }) {
    const res = await this.get(Const.balanceUrl, { account });
    console.log(res.result)
    if (!res) {
      return {};
    } 
    return res.result;
  }

  async getAllBalance({ account }) {
    const res = await this.get(Const.balanceAllUrl, { account });
    console.log(res.result)
    if (!res) {
      return {};
    } 
    return res.result;
  }
}

const listRequest = new ListRequest();
export default listRequest;