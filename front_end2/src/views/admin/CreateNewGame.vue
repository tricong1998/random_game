<template>
  <div class="animated fadeIn">

    <b-card>
      <div slot="header">
        <strong>Create New Game</strong>
      </div>
      <b-form-group>
        <label for="company">Fee Join</label>
        <b-form-input @keypress="validatePrice($event)" v-model="feeJoin" type="number" id="company" placeholder="Fee Join"></b-form-input>
      </b-form-group>
      <b-form-group>
        <label for="vat">Amount of Players</label>
        <b-form-input @keypress="validate($event)" v-model="numberOfPlayers" type="number" id="vat" placeholder="Amount of Players"></b-form-input>
      </b-form-group>
      <b-form-group>
        <label for="street">Expire Commit Time</label>
        <b-form-input @keypress="validate($event)" v-model="expireCommitTime" type="number" id="street" placeholder="Second"></b-form-input>
      </b-form-group>
      <b-form-group>
        <label for="city">Expire Join Time</label>
        <b-form-input @keypress="validate($event)" v-model="expireJoinTime" type="number" id="city" placeholder="Second"></b-form-input>
      </b-form-group>
      <b-form-group>
        <label for="country">Ratio</label>
        <b-form-input @keypress="validate($event)" v-model="priceRatio" type="number" id="country" placeholder="Ratio Price (%)"></b-form-input>
      </b-form-group>
    </b-card>
    <b-row cols="12" class="align-items-center">
      <b-col cols="3" sm="3" md="2" class="mb-3 mb-xl-0">
        <b-button @click="back" block variant="primary">Return</b-button>
      </b-col>
      <b-col cols="3" sm="3" md="2" class="mb-3 mb-xl-0">
        <b-button @click="submit" block variant="success">Submit</b-button>
      </b-col>
    </b-row>     
  </div>
</template>

<script>
import { shuffleArray } from '@/shared/utils'
import cTable from '../base/Table.vue'
import Const from '../../core/base/Const';
import Toast from '../../core/base/Toast';
import AdminRequest from '@/core/request/AdminRequest'

export default {
  name: 'create_new_game',
  components: {cTable},
  data: () => {
    return {
      numberOfPlayers: null,
      feeJoin: null,
      expireCommitTime: null,
      expireJoinTime: null,
      priceRatio: null,
      error: false,
      message: ''
    }
  },
  methods: {
    back(item) {
      this.$router.push({ name: 'Game' })
    },
    async submit() {
      if (!this.feeJoin) {
        Toast.alertHide('Fee Join is required', 5000, Const.dangerLevel, Const.alertTitle, this)
        return;
      }      
      if (!this.numberOfPlayers) {
        Toast.alertHide('Amount of Players is required', 5000, Const.dangerLevel, Const.alertTitle, this)
        return;
      }
      if (!this.expireCommitTime) {
        Toast.alertHide('Expire Commit Time is required', 5000, Const.dangerLevel, Const.alertTitle, this)
        return;
      }
      if (!this.expireJoinTime) {
        Toast.alertHide('Expire Join Time is required', 5000, Const.dangerLevel, Const.alertTitle, this)
        return;
      }
      if (!this.priceRatio) {
        Toast.alertHide('Ratio is required', 5000, Const.dangerLevel, Const.alertTitle, this)
        return;
      }             
      if (!this.priceRatio.match(/^-?\d*(\.\d+)?$/))   {
        Toast.alertHide('Ratio is invalid', 5000, Const.dangerLevel, Const.alertTitle, this)
        return;        
      }
      const res = await AdminRequest.init({ numberOfPlayers: this.numberOfPlayers, feeJoin: this.feeJoin, 
                            expireCommitTime: this.expireCommitTime, expireJoinTime: this.expireJoinTime, priceRatio: this.priceRatio });
      if (res) {
        Toast.alertHide('Successfully', 5000, Const.successLevel, Const.alertTitle, this)
        this.$router.push({ name: 'Game' })
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
    validatePrice (e) {
      let ev = e || window.event;
      let key = ev.keyCode || ev.which;
      key = String.fromCharCode( key );
      var regex = /[0-9]/;
      if( !regex.test(key) ) {
        ev.returnValue = false;
        if(ev.preventDefault) ev.preventDefault();
      }      
    },    
    validatePriceRatio (e) {
      let ev = e || window.event;
      let key = ev.keyCode || ev.which;
      key = String.fromCharCode( key );
      var regex = /^\d*\.?\d*$/;
      if( !regex.test(key) ) {
        ev.returnValue = false;
        if(ev.preventDefault) ev.preventDefault();
      }   
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
      // this.getAllGame();
    },

    join: function(params) {
      // this.getAllGame();
    },
    
    cancel: function(params) {
      // this.getAllGame();
    },

    start_commit: function(params) {
      // this.getAllGame();
    },

    start_reveal: function(params) {
      // this.getAllGame();
    },

    end_game: function(params) {
      this.getAllGame();
    },
  },    
}
</script>
