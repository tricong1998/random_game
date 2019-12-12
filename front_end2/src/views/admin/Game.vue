<template>
  <div class="animated fadeIn">

    <b-row>
      <b-col>
        <c-table @next="next" @prev="prev" :currentPage="currentPage" v-on:row-clicked="detail" :table-data="items" :fields="fields" caption="<i class='fa fa-align-justify'></i> Games"></c-table>
      </b-col>
    </b-row><!--/.row-->
    <b-col cols="6" sm="3" md="2" size="lg" l class="mb-3 mb-xl-0">
      <b-button @click="createNewGame" block variant="primary">Create New Game</b-button>
    </b-col>    
  </div>
</template>

<script>
import { shuffleArray } from '@/shared/utils'
import cTable from '../base/Table.vue'
import ListRequest from '@/core/request/ListRequest'
import Utils from '@/core/base/Utils'

const someData = () => [
  {id: 0, numberPlayers: 2, joinedPlayer: 1, admin: 'randomgame', feeJoin: 2, priceRatio: 0.8, expireJoinTime: 2, expireCommitTime: 20, state: 0, result: 7, activeKey: 'jaflkdjsaf', activeKeyHash: 'jaflkdjsaf', _rowVariant: 'success'},
  // {id: 1, numberPlayers: 2, joinedPlayer: 2, admin: 'randomgame', feeJoin: 2, priceRatio: 0.8, expireJoinTime: 2, expireCommitTime: 20, state: 1, result: 7, activeKey: 'jaflkdjsaf', activeKeyHash: 'jaflkdjsaf',_rowVariant: 'danger'},
  // {id: 2, numberPlayers: 2, joinedPlayer: 2, admin: 'randomgame', feeJoin: 2, priceRatio: 0.8, expireJoinTime: 2, expireCommitTime: 20, state: 2, result: 7, activeKey: 'jaflkdjsaf', activeKeyHash: 'jaflkdjsaf', _rowVariant: 'info'},
  // {id: 3, numberPlayers: 2, joinedPlayer: 1, admin: 'randomgame', feeJoin: 2, priceRatio: 0.8, expireJoinTime: 2, expireCommitTime: 20, state: 0, result: 7, activeKey: 'jaflkdjsaf', activeKeyHash: 'jaflkdjsaf'},
  // {id: 4, numberPlayers: 2, joinedPlayer: 2, admin: 'randomgame', feeJoin: 2, priceRatio: 0.8, expireJoinTime: 2, expireCommitTime: 20, state: 4, result: 3, activeKey: 'jaflkdjsaf', activeKeyHash: 'jaflkdjsaf'},
  // {id: 5, numberPlayers: 2, joinedPlayer: 1, admin: 'randomgame', feeJoin: 2, priceRatio: 0.8, expireJoinTime: 2, expireCommitTime: 20, state: 0, result: 7, activeKey: 'jaflkdjsaf', activeKeyHash: 'jaflkdjsaf'},
  // {id: 6, numberPlayers: 2, joinedPlayer: 2, admin: 'randomgame', feeJoin: 2, priceRatio: 0.8, expireJoinTime: 2, expireCommitTime: 20, state: 3, result: 7, activeKey: 'jaflkdjsaf', activeKeyHash: 'jaflkdjsaf'},
  // {id: 7, numberPlayers: 2, joinedPlayer: 2, admin: 'randomgame', feeJoin: 2, priceRatio: 0.8, expireJoinTime: 2, expireCommitTime: 20, state: 2, result: 7, activeKey: 'jaflkdjsaf', activeKeyHash: 'jaflkdjsaf'},
  // {id: 8, numberPlayers: 3, joinedPlayer: 2, admin: 'randomgame', feeJoin: 2, priceRatio: 0.8, expireJoinTime: 2, expireCommitTime: 20, state: 0, result: 7, activeKey: 'jaflkdjsaf', activeKeyHash: 'jaflkdjsaf'},
  // {id: 9, numberPlayers: 4, joinedPlayer: 4, admin: 'randomgame', feeJoin: 2, priceRatio: 0.8, expireJoinTime: 2, expireCommitTime: 20, state: 4, result: 2, activeKey: 'jaflkdjsaf', activeKeyHash: 'jaflkdjsaf'},
  // {id: 10, numberPlayers: 5, joinedPlayer: 5, admin: 'randomgame', feeJoin: 2, priceRatio: 0.8, expireJoinTime: 2, expireCommitTime: 20, state: 0, result: 7, activeKey: 'jaflkdjsaf', activeKeyHash: 'jaflkdjsaf'},
  // {id: 11, numberPlayers: 7, joinedPlayer: 7, admin: 'randomgame', feeJoin: 2, priceRatio: 0.8, expireJoinTime: 2, expireCommitTime: 20, state: 3, result: 7, activeKey: 'jaflkdjsaf', activeKeyHash: 'jaflkdjsaf'},
  // {id: 12, numberPlayers: 4, joinedPlayer: 4, admin: 'randomgame', feeJoin: 2, priceRatio: 0.8, expireJoinTime: 2, expireCommitTime: 20, state: 2, result: 7, activeKey: 'jaflkdjsaf', activeKeyHash: 'jaflkdjsaf'},
  // {id: 13, numberPlayers: 2, joinedPlayer: 2, admin: 'randomgame', feeJoin: 2, priceRatio: 0.8, expireJoinTime: 2, expireCommitTime: 20, state: 0, result: 7, activeKey: 'jaflkdjsaf', activeKeyHash: 'jaflkdjsaf'},
  // {id: 14, numberPlayers: 3, joinedPlayer: 2, admin: 'randomgame', feeJoin: 2, priceRatio: 0.8, expireJoinTime: 2, expireCommitTime: 20, state: 0, result: 7, activeKey: 'jaflkdjsaf', activeKeyHash: 'jaflkdjsaf'},
  // {id: 15, numberPlayers: 4, joinedPlayer: 0, admin: 'randomgame', feeJoin: 2, priceRatio: 0.8, expireJoinTime: 2, expireCommitTime: 20, state: 0, result: 7, activeKey: 'jaflkdjsaf', activeKeyHash: 'jaflkdjsaf'},
  // {id: 16, numberPlayers: 5, joinedPlayer: 5, admin: 'randomgame', feeJoin: 2, priceRatio: 0.8, expireJoinTime: 2, expireCommitTime: 20, state: 3, result: 7, activeKey: 'jaflkdjsaf', activeKeyHash: 'jaflkdjsaf'},
  // {id: 17, numberPlayers: 7, joinedPlayer: 7, admin: 'randomgame', feeJoin: 2, priceRatio: 0.8, expireJoinTime: 2, expireCommitTime: 20, state: 2, result: 7, activeKey: 'jaflkdjsaf', activeKeyHash: 'jaflkdjsaf'},
  // {id: 18, numberPlayers: 6, joinedPlayer: 6, admin: 'randomgame', feeJoin: 2, priceRatio: 0.8, expireJoinTime: 2, expireCommitTime: 20, state: 0, result: 7, activeKey: 'jaflkdjsaf', activeKeyHash: 'jaflkdjsaf'},
  // {id: 19, numberPlayers: 7, joinedPlayer: 7, admin: 'randomgame', feeJoin: 2, priceRatio: 0.8, expireJoinTime: 2, expireCommitTime: 20, state: 0, result: 7, activeKey: 'jaflkdjsaf', activeKeyHash: 'jaflkdjsaf'},
  // {id: 20, numberPlayers: 5, joinedPlayer: 5, admin: 'randomgame', feeJoin: 2, priceRatio: 0.8, expireJoinTime: 2, expireCommitTime: 20, state: 0, result: 7, activeKey: 'jaflkdjsaf', activeKeyHash: 'jaflkdjsaf'},
  // {id: 21, numberPlayers: 7, joinedPlayer: 7, admin: 'randomgame', feeJoin: 2, priceRatio: 0.8, expireJoinTime: 2, expireCommitTime: 20, state: 3, result: 7, activeKey: 'jaflkdjsaf', activeKeyHash: 'jaflkdjsaf'},
  // {id: 22, numberPlayers: 4, joinedPlayer: 4, admin: 'randomgame', feeJoin: 2, priceRatio: 0.8, expireJoinTime: 2, expireCommitTime: 20, state: 2, result: 7, activeKey: 'jaflkdjsaf', activeKeyHash: 'jaflkdjsaf'},
  // {id: 23, numberPlayers: 3, joinedPlayer: 3, admin: 'randomgame', feeJoin: 2, priceRatio: 0.8, expireJoinTime: 2, expireCommitTime: 20, state: 0, result: 7, activeKey: 'jaflkdjsaf', activeKeyHash: 'jaflkdjsaf'},
  // {id: 24, numberPlayers: 5, joinedPlayer: 5, admin: 'randomgame', feeJoin: 2, priceRatio: 0.8, expireJoinTime: 2, expireCommitTime: 20, state: 0, result: 7, activeKey: 'jaflkdjsaf', activeKeyHash: 'jaflkdjsaf'}
]

export default {
  name: 'game',
  components: {cTable},
  data: () => {
    return {
      items: someData,
      itemsArray: someData(),
      fields: [
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
      currentPage: 1,
      more: false,
    }
  },
  methods: {
    detail(item) {
      this.$router.push({ name: 'Detail', params: { id: item.id }})
    },
    createNewGame() {
      this.$router.push({ name: 'CreateNewGame' });
    },
    async getAllGame() {
      const res = await ListRequest.getAllGames(this.currentPage);
      const data = res.games;
      this.more = res.more;
      this.items = data.map(element => {
        return Utils.standardizeGame(element);
        return element;
      });
    },
    next(page) {
      this.currentPage = page;
      this.getAllGame({ page });
    },
    prev(page) {
      this.currentPage = page;
      this.getAllGame({ page });
    },    
  },
  sockets: {
    connect: function() {
      // Fired when the socket connects.
    },

    disconnect: function() {
    },

    // Fired when the server sends something on the "messageChannel" channel.
    init: function() {
      this.getAllGame();
    },

    join: function(params) {
      this.getAllGame();
    },
    
    cancel: function(params) {
      this.getAllGame();
    },

    start_commit: function(params) {
      this.getAllGame();
    },

    start_reveal: function(params) {
      this.getAllGame();
    },

    end_game: function(params) {
      this.getAllGame();
    },
  },  
  beforeMount: async function() {
    await this.getAllGame();
  },
  // created: async function () {
  //   // this.items = await this.getAllGame();
  // },
}
</script>
