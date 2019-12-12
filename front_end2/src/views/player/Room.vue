<template>
  <div class="animated fadeIn player">
    <b-row>
      <b-col sm="2" class="left">
        <!-- <c-table :table-data="[game]" :fields="field" :isPaging="false" caption="<i class='fa fa-align-justify'></i> Game"></c-table> -->
            <b-list-group class="tab-infor">
              <b-list-group-item>GameId: {{this.game.id}}</b-list-group-item>
              <!-- <b-list-group-item>State: {{this.game.state}}</b-list-group-item> -->
              <!-- <b-list-group-item>Result: {{this.game.result}}</b-list-group-item> -->
              <b-list-group-item>Fee Join: {{this.game.feeJoin}}</b-list-group-item>
              <!-- <b-list-group-item>Active Key: {{this.game.activeKey}}</b-list-group-item> -->
              <!-- <b-list-group-item>Active Key Hash: {{this.game.activeKeyHash}}</b-list-group-item> -->
              <b-list-group-item>Joiners: {{this.game.joinedPlayer}}</b-list-group-item>
              <b-list-group-item>Ratio: {{this.game.priceRatio}}%</b-list-group-item>
              <b-list-group-item>Admin: <b-link :href="getLink(game.admin)" target="_blank">{{this.game.admin}}</b-link></b-list-group-item>
              <b-button @click="gameDetail()">Detail</b-button>
            </b-list-group>        
      </b-col>
      <b-col cols="8" sm="8" offset="2">
        <b-row align-h="center" align-v="center" class="justify-content-md-center">
          <b-col sm="2">
              <b-img @click="choose(1)" :src="require('../../containers/img/predict1.png')" fluid></b-img>
            <!-- <b-img alt="" src="../../containers/img/dice_png/dice-six-faces-one.png" width="200"> -->
          </b-col>
          <b-col sm="2">
              <b-img @click="choose(2)" :src="require('../../containers/img/predict2.png')" fluid></b-img>
          </b-col>
          <b-col sm="2">
              <b-img @click="choose(3)" :src="require('../../containers/img/predict3.png')" fluid></b-img>
          </b-col>                                            
        </b-row>
        <b-row align-h="center" align-v="center" class="justify-content-md-center state-game">
          <b-col sm="3">
              <span class="time-left">{{countDown}}</span>
              <b-img :src="require('../../containers/img/time_bg.png')" fluid center></b-img>
          </b-col>        
          <b-col sm="3">
              <b-img v-if="game.result !== 'None'" :src="result" fluid center></b-img>
              <b-img class="chum" v-bind:class="{ tranfornchum: tranform}" v-if="game.result === 'None'" :src="chum" fluid center></b-img>
              <b-img v-if="loading" :src="require('../../containers/img/loading.gif')" class="loading" fluid center></b-img>
          </b-col> 
          <b-col sm="3">
              <span class="state">{{this.game.state}}</span>
              <b-img :src="require('../../containers/img/state_bg.png')" fluid center></b-img>
          </b-col>                     
        </b-row>        
        <b-row align-h="center" align-v="center" class="justify-content-md-center">
          <b-col sm="2">
              <b-img @click="choose(4)" :src="require('../../containers/img/predict4.png')" fluid></b-img>
          </b-col>
          <b-col sm="2">
              <b-img @click="choose(5)" :src="require('../../containers/img/predict5.png')" fluid></b-img>
          </b-col>
          <b-col sm="2">
              <b-img @click="choose(6)" :src="require('../../containers/img/predict6.png')" fluid></b-img>
          </b-col>                       
        </b-row>   
        <b-row v-if="number" align-h="center" align-v="center" class="justify-content-md-center show">
          <!-- <h5>Your Number</h5>  -->
          <b-col sm="2">
              <b-img :src="yourNumber" fluid></b-img>
          </b-col>        
        </b-row>                
     
      </b-col>
      <b-col sm="2" class="right">
            <b-list-group class="tab-infor">
              <b-list-group-item>PlayerId: {{this.player.playerId}}</b-list-group-item>
              <b-list-group-item>State: {{this.player.isCommit}}</b-list-group-item>
              <b-list-group-item>Predicted Number: {{this.player.numberPredict}}</b-list-group-item>
              <b-list-group-item>Balance: {{this.player.balance}}</b-list-group-item>
              <b-list-group-item>Account: <b-link :href="getLink(player.user)" target="_blank">{{this.player.user}}</b-link></b-list-group-item>
              <b-button @click="playerDetail()">Detail</b-button>              
            </b-list-group>      
      </b-col>      
    </b-row><!--/.row-->        
    <b-row cols="8" class="align-items-center button-grp">
      <b-col cols="3" sm="3" md="2" class="mb-3 mb-xl-0 btn0">
        <b-button pill @click="back" block variant="primary">Return</b-button>
      </b-col>      
      <b-col v-if='game.state === "Active"' cols="3" sm="3" md="2" class="mb-3 mb-xl-0 btn1">
        <b-button pill @click="cancel" block variant="danger">Cancel</b-button>
      </b-col>
      <b-col offset="8">
        <span class="your-secret">Your Secret: {{this.secret}}</span>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import { shuffleArray } from '@/shared/utils'
import cTable from '../base/Table.vue'
import PlayerRequest from '@/core/request/PlayerRequest'

const someData = () => [
  {playerId: 0, numberPredict: '2', user: 'Member', isCommit: 2, isWin: 0, state: 'Active', _rowVariant: 'success'},
]
const game = () => {
  return [{id: 0, numberPlayers: '6', admin: 'Member', feeJoin: 2, priceRatio: 0.8, state: 'Active', _rowVariant: 'success'}]
}

import ListRequest from '@/core/request/ListRequest'
import Utils from '@/core/base/Utils'
import Const from '../../core/base/Const';
import Toast from '../../core/base/Toast';
import ranString from 'randomstring';
import BigNumber from 'bignumber.js';

export default {
  name: 'room',
  components: {cTable},
  // props: {
  //   game: {
  //     id: null,
  //     numberPlayers: null,
  //     admin: null,
  //     feeJoin: null,
  //     priceRatio: null,
  //     state: null
  //   }
  // },
  data: () => {
    return {
      game: {
        id: null,
        numberPlayers: null,
        admin: null,
        feeJoin: null,
        priceRatio: null,
        state: null,
        result: null,
        blockHash: null,
        expireCommitTime: null,
        expireJoin: null,
        activeKeyHash: null,
        activeKey: null,
      },
      player: {
        playerId: null,
        numberPredict: null,
        user: null,
        isCommit: null,
        isWin: null,
        secret: null,
        hash: null,
        gameId: null,
        balance: null,
        unRevealSecret: null
      },
      items: [],
      fields: [
        {key: 'playerId', label: 'Id', sortable: true},
        {key: 'numberPredict', label: 'Predicted Number'},
        {key: 'user'},
        {key: 'isCommit', label: 'Action', sortable: true},
        {key: 'isWin', label: 'Is Win'},
        {key: 'balance', label: 'Balance'}

      ],
      field: [
        {key: 'id', label: 'Id', sortable: true},
        {key: 'numberPlayers', label: 'Players'},
        {key: 'joinedPlayer', label: 'Joined Players'},
        {key: 'admin'},
        {key: 'state', sortable: true},
        {key: 'feeJoin', label: 'Fee Join', sortable: true},
        {key: 'priceRatio', label: 'Price Ratio'},
        {key: 'result', label: 'Result'},
        {key: 'activeKeyHash', label: 'Active Key Hash'},
        {key: 'activeKey', label: 'Active Key'},
        {key: 'expireCommitTime', label: 'Expire Commit Time'},
        {key: 'activeKey', label: 'Active Key'},
        {key: 'expireJoinTime', label: 'Expire Join Time'},
      ],
      result: null,
      secret: null,
      commit: false,
      number: null,
      countDown: 0,
      tranform: true,
      chum: require('../../containers/img/chum.png'),
      loading: false,
      yourNumber: null,
    }
  },
  sockets: {
    connect: function() {
      // Fired when the socket connects.
    },

    disconnect: function() {
    },

    // Fired when the server sends something on the "messageChannel" channel.
    init: function() {
      this.getAll();
    },

    commit: function(params) {
      if (params.playerId === this.player.playerId) {
        // Toast.alertHide('You win', 5000, Const.successLevel, Const.alertTitle, this)
        this.getAll(); 
      }
    },

    reveal: function(params) {
      if (params.playerId === this.player.playerId) {
        // Toast.alertHide('You win', 5000, Const.successLevel, Const.alertTitle, this)
        this.getAll(); 
      }    },

    join: function(params) {
      if (params.gameId === this.game.id) {
        Toast.alertHide('There is one player join', 5000, Const.successLevel, Const.alertTitle, this)
        this.getAll(); 
      }    
    },
    
    cancel: function(params) {
      if (params.gameId === this.game.id) {
        Toast.alertHide('Game was canceled', 5000, Const.successLevel, Const.alertTitle, this)
        this.getAll(); 
      }    
    },

    start_commit: function(params) {
      if (params.gameId === this.game.id) {
        Toast.alertHide('Start Commit Turn', 5000, Const.successLevel, Const.alertTitle, this)
        this.getAll(); 
      }        
    },

    start_reveal:  function(params) {
      if (params.gameId === this.game.id) {
        Toast.alertHide('Start Reveal Turn', 5000, Const.successLevel, Const.alertTitle, this)
        this.getAll(); 
      }    
    },

    end_game: async function(params) {
      if (params.gameId === this.game.id) {
        Toast.alertHide('Finish game', 5000, Const.successLevel, Const.alertTitle, this)
        this.getAll(); 
      }      
    },
  },   
  methods: {
    gameDetail() {
      return window.open(`${process.env.VUE_APP_EXPLORER}/account/${
        process.env.VUE_APP_ACCOUNT_SMART_CONTRACT
        }?mode=contract&sub=tables&table=games&lowerBound=${this.game.id}&upperBound=${this.game.id}&limit=1`, '_blank');
    },
    playerDetail() {
      return window.open(`${process.env.VUE_APP_EXPLORER}/account/${
        process.env.VUE_APP_ACCOUNT_SMART_CONTRACT
        }?mode=contract&sub=tables&table=people&lowerBound=${this.player.playerId}&upperBound=${this.player.playerId}&limit=1`, '_blank');      
    },
    getLink(account) {
      return `${process.env.VUE_APP_EXPLORER}/account/${account}`;
    },
    choose(number) {
      console.log(this.commit)
      if (!this.commit) {
        return;
      }
      this.number = number;
      this.submit();
      this.yourNumber = this.getYourNumber(number);
    },
    getYourNumber(number) {
      switch (number) {
        case 1: {
          return require('../../containers/img/predict1.png')
        }
        case 2: {
          return require('../../containers/img/predict2.png')
        }
        case 3: {
          return require('../../containers/img/predict3.png')
        }
        case 4: {
          return require('../../containers/img/predict4.png')
        }
        case 5: {
          return require('../../containers/img/predict5.png')
        }
        case 6: {
          return require('../../containers/img/predict6.png')
        }
        default:
          return require('../../containers/img/loading.gif')                                     
      }      
    },

    getChum() {
      return require('../../containers/img/chum.png');
    },
    checkWin() {
      if (this.game.result === this.player.numberPredict) {
        Toast.alertHide('You win', 5000, Const.successLevel, Const.alertTitle, this)
      } else {
        Toast.alertHide('You lose', 5000, Const.dangerLevel, Const.alertTitle, this)
      }
    },

    validate (e) {
      let ev = e || window.event;
      let key = ev.keyCode || ev.which;
      key = String.fromCharCode( key );
      var regex = /[0-9]/;
      if( !regex.test(key) ) {
        ev.returnValue = false;
        if(ev.preventDefault) ev.preventDefault();
      }      
    },

    countDownTimer() {
        if(this.countDown && this.countDown > 0) {
            setTimeout(() => {
                this.countDown -= 1
                this.countDownTimer()
            }, 1000)        
        } else {
          this.commit = false;
        }
    },    
    back() {
      this.$router.push({ name: 'Games' });
    },
    cancel() {
      
    },
    async getOneGame() {
      const _game  = await ListRequest.getOneGame({ gameId: this.game.id});
      if (_game.state === 1 && this.player.isCommit === 'Joined') {
        this.commit = true;
        this.countDown = new BigNumber(_game.expireCommitTime).minus(new BigNumber(new BigNumber(Date.now()).dividedBy(1000).toFixed(0)).minus(_game.startCommitTime).toNumber());
        if (this.countDown < 0) {
          this.countDown = 0;
        }
        console.log(this.countDown);
        this.countDownTimer();
      } else if (_game.state === 4) {
        this.result = this.getResult(_game.result);
        this.yourNumber = this.getYourNumber(this.player.numberPredict);
        this.number = this.player.numberPredict;
      } else {
        this.tranform = true
        this.countDown = 0;
      } 
      if (_game.state === 3) {
        this.result = this.getResult(_game.result);
      }
      this.secret = this.player.secret ? this.player.secret : this.secret;
      this.game = Utils.standardizeGame(_game);
    },

    getResult (result) {
      switch (result) {
        case 1: {
          return require('../../containers/img/sicbo_0.png')
        }
        case 2: {
          return require('../../containers/img/sicbo_1.png')
        }
        case 3: {
          return require('../../containers/img/sicbo_2.png')
        }
        case 4: {
          return require('../../containers/img/sicbo_3.png')
        }
        case 5: {
          return require('../../containers/img/sicbo_4.png')
        }
        case 6: {
          return require('../../containers/img/sicbo_5.png')
        }
        default:
          return require('../../containers/img/loading.gif')                                     
      }
    },

    async submit() {
      if (!this.number) {
        Toast.alertHide('Number is required', 5000, Const.dangerLevel, Const.alertTitle, this)
         return;
      }
      const secret = ranString.generate({
        length: Const.length,
        charset: Const.typeRandomString
      })
      this.secret = `${this.number}${secret}`;
      await PlayerRequest.commit({ account: this.player.user, playerId: this.player.playerId, secret: this.secret });
      this.commit = false;
      Toast.alertHide('Successfully', 5000, Const.successLevel, Const.alertTitle, this)
    },

    async getOnePlayer() {
      this.playerId = this.$route.params.id;
      try {
        const _player = await ListRequest.getOnePlayer({ playerId: this.playerId});
        const balance = await ListRequest.getBalance({ account: _player.user });
        this.player = Utils.standardizePlayers(_player);    
        this.player.balance = balance.balance;
        this.game.id = this.player.gameId;
      } catch (e) {
        Toast.alertHide(e, 5000, Const.dangerLevel, Const.alertTitle, this)        
      }

    },

    async getAll() {
      await this.getOnePlayer();
      await this.getOneGame();
    },
  },
  beforeMount: async function() {
    await this.getAll();
  },
  mounted() {
    if (this.game.state === 'Active') {
      this.back();
    }
  },
  // computed: {
  //   getResult: function() {
  //     switch (this.result) {
  //       case 1: {
  //         return require('../../containers/img/sicbo_0.png')
  //       }
  //       case 2: {
  //         return require('../../containers/img/sicbo_1.png')
  //       }
  //       case 3: {
  //         return require('../../containers/img/sicbo_2.png')
  //       }
  //       case 4: {
  //         return require('../../containers/img/sicbo_3.png')
  //       }
  //       case 5: {
  //         return require('../../containers/img/sicbo_4.png')
  //       }
  //       case 6: {
  //         return require('../../containers/img/sicbo_5.png')
  //       }
  //       default:
  //         return require('../../containers/img/loading.gif')                                     
  //     }
  //   },
  // },
}
</script>

<style lang="scss" scoped>
  .player {
      background-image: url('../../containers/img/bg1.jpg');
      padding: 50px
    // background:   
  }
  .tab-infor {
    background-color: green !important; 
  }
  .tranfornchum {
    width: 100%;
    height: 100%;
    position: relative;
    transform: scale(.7);
    z-index: 4;
  }  
  .time-left {
    color: #f8db00;
    text-shadow: 0 0 0.1rem #f8db00;
    font-weight: 600;
    margin: 0;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);    
  }
  .state {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #fff;
  }
  .state-game {
    margin: 2%;
  }
  .loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);    
    z-index: 1;
  }
  .chum {
    z-index: 0;
  }
  .show {
    margin: 4%;
  }
  .button-grp {
    // position: absolute;
    bottom: 2%;
  }
  .btn0 .btn1 {
    position: absolute;
  }
  .left {
    position: absolute;
    left: 1%;
  }
  .right {
    position: absolute;
    right: 1%;
  }  
  .your-secret {
    color: #f8db00;
  }
</style>
