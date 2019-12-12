<template>
  <div class="animated fadeIn">
    <b-row>
      <b-col>
        <c-table :table-data="[game]" :fields="field" :isPaging="false" caption="<i class='fa fa-align-justify'></i> Games"></c-table>
      </b-col>
    </b-row><!--/.row-->
    <b-row>
      <b-col>
        <c-table :table-data="items" :fields="fields" caption="<i class='fa fa-align-justify'></i> Players"></c-table>
      </b-col>
    </b-row><!--/.row-->
    <b-row cols="12" class="align-items-center">
      <b-col cols="3" sm="3" md="2" class="mb-3 mb-xl-0">
        <b-button @click="back" block variant="primary">Return</b-button>
      </b-col>
      <b-col cols="3" sm="3" md="2" class="mb-3 mb-xl-0">
        <b-button @click="cancel" block variant="danger">Cancel</b-button>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import { shuffleArray } from '@/shared/utils'
import cTable from '../base/Table.vue'

const someData = () => [
  {playerId: 0, numberPredict: '2', user: 'Member', isCommit: 2, isWin: 0, state: 'Active', _rowVariant: 'success'},
  {playerId: 1, numberPredict: '2', user: 'Staff', isCommit: 2, isWin: 0, state: 'Banned', _rowVariant: 'danger'},
  {playerId: 2, numberPredict: '2', user: 'Admin', isCommit: 2, isWin: 0, state: 'Inactive', _rowVariant: 'info'},
  {playerId: 3, numberPredict: '2', user: 'Member', isCommit: 2, isWin: 0, state: 'Pending'},
  {playerId: 4, numberPredict: '2', user: 'Staff', isCommit: 2, isWin: 0, state: 'Active'},
  {playerId: 5, numberPredict: '2', user: 'Member', isCommit: 2, isWin: 0, state: 'Active'},
  {playerId: 6, numberPredict: '2', user: 'Staff', isCommit: 2, isWin: 0, state: 'Banned'},
  {playerId: 7, numberPredict: '2', user: 'Admin', isCommit: 2, isWin: 0, state: 'Inactive'},
  {playerId: 8, numberPredict: '2', user: 'Member', isCommit: 2, isWin: 0, state: 'Pending'},
  {playerId: 9, numberPredict: '2', user: 'Staff', isCommit: 2, isWin: 0, state: 'Active'},
  {playerId: 10, numberPredict: '1', user: 'Member', isCommit: 2, isWin: 0, state: 'Active'},
  {playerId: 11, numberPredict: '2', user: 'Staff', isCommit: 2, isWin: 0, state: 'Banned'},
  {playerId: 12, numberPredict: '21', user: 'Admin', isCommit: 2, isWin: 0, state: 'Inactive'},
  {playerId: 13, numberPredict: '21', user: 'Member', isCommit: 2, isWin: 0, state: 'Pending'},
  {playerId: 14, numberPredict: '2', user: 'Staff', isCommit: 2, isWin: 0, state: 'Active'},
  {playerId: 15, numberPredict: '1', user: 'Member', isCommit: 2, isWin: 0, state: 'Active'},
  {playerId: 16, numberPredict: '20', user: 'Staff', isCommit: 2, isWin: 0, state: 'Banned'},
  {playerId: 17, numberPredict: '20', user: 'Admin', isCommit: 2, isWin: 0, state: 'Inactive'},
  {playerId: 18, numberPredict: '20', user: 'Member', isCommit: 2, isWin: 0, state: 'Pending'},
  {playerId: 19, numberPredict: '22', user: 'Staff', isCommit: 2, isWin: 0, state: 'Active'},
  {playerId: 20, numberPredict: '12', user: 'Member', isCommit: 2, isWin: 0, state: 'Active'},
  {playerId: 21, numberPredict: '20', user: 'Staff', isCommit: 2, isWin: 0, state: 'Banned'},
  {playerId: 22, numberPredict: '2', user: 'Admin', isCommit: 2, isWin: 0, state: 'Inactive'},
  {playerId: 23, numberPredict: '2', user: 'Staff', isCommit: 2, isWin: 0, state: 'Active'},
  {playerId: 24, numberPredict: '1', user: 'Member', isCommit: 2, isWin: 0, state: 'Pending'}
]
const game = () => {
  return [{id: 0, numberPlayers: '6', admin: 'Member', feeJoin: 2, priceRatio: 0.8, state: 'Active', _rowVariant: 'success'}]
}

import ListRequest from '@/core/request/ListRequest'
import Utils from '@/core/base/Utils'
import Const from '../../core/base/Const';
import Toast from '../../core/base/Toast';

export default {
  name: 'game_detail',
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
        state: null
      },
      items: [],
      fields: [
        {key: 'playerId', label: 'Id', sortable: true},
        {key: 'numberPredict', label: 'Predicted Number'},
        {key: 'user'},
        {key: 'isCommit', label: 'Action', sortable: true},
        {key: 'isWin', label: 'Is Win'}
      ],
      field: [
        {key: 'id', label: 'Id', sortable: true},
        {key: 'numberPlayers', label: 'Amount Players'},
        {key: 'admin'},
        {key: 'state', sortable: true},
        {key: 'feeJoin', label: 'Fee Join', sortable: true},
        {key: 'priceRatio', label: 'Price Ratio'}
      ],
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
      this.getOneGame();
    },

    join: function(params) {
      this.getOneGame();
    },
    
    cancel: function(params) {
      this.getOneGame();
    },

    start_commit: function(params) {
      this.getOneGame();
    },

    start_reveal: function(params) {
      this.getOneGame();
    },

    end_game: function(params) {
      this.getOneGame();
    },
  },   
  methods: {
    back() {
      this.$router.push({ name: 'Game' });
    },
    cancel() {
      
    },
    async getOneGame() {
      this.game.id = this.$route.params.id;
      const [_game, _players] = await Promise.all([
        ListRequest.getOneGame({ gameId: this.game.id}),
        ListRequest.getPlayersGame({ gameId: this.game.id})
      ]);
      this.game = Utils.standardizeGame(_game);
      this.items = _players.map(_player => Utils.standardizePlayers(_player));
    }
  },
  beforeMount: async function() {
    await this.getOneGame();
  },
}
</script>
