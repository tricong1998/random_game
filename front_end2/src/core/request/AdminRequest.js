import Const from '../base/Const';
import BaseRequest from '../base/BaseRequest';

class AdminRequest extends BaseRequest {
  async init ({ numberOfPlayers, feeJoin, expireCommitTime, expireJoinTime, priceRatio }) {
    return await this.post(Const.initUrl, {numberOfPlayers, feeJoin, expireCommitTime, expireJoinTime, priceRatio});
  }

  async cancel ({ gameId }) {
    return await this.post(Const.cancelUrl, {gameId});
  }
}

const adminRequest = new AdminRequest();
export default adminRequest;