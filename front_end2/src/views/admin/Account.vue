<template>
  <div class="animated fadeIn">
    <b-row>
      <b-col>
        <b-card header="Doughnut Chart">
          <div class="chart-wrapper">
            <doughnut-example chartId="chart-doughnut-01"  :busyBalance="busyBalance" :reliableBalance="reliableBalance"/>
          </div>
        </b-card>
      </b-col>
      <b-col>
        <b-card>
          <b-col>
            <c-table :table-data="[game]" :fields="field" :isPaging="false" caption="<i class='fa fa-align-justify'></i> Game"></c-table>
          </b-col>
        </b-card>             
      </b-col>      

 
    </b-row>
  </div>
</template>

<script>
import BarExample from '../charts/BarExample'
import LineExample from '../charts/LineExample'
import DoughnutExample from '../charts/DoughnutExample'
import RadarExample from '../charts/RadarExample'
import PieExample from '../charts/PieExample'
import PolarAreaExample from '../charts/PolarAreaExample'
import ListRequest from '@/core/request/ListRequest'
import BigNumber from 'bignumber.js'
import Toast from '../../core/base/Toast';
import Const from '../../core/base/Const';
import cTable from '../base/Table.vue'

export default {
  name: 'account',
  components: {
    BarExample,
    LineExample,
    DoughnutExample,
    RadarExample,
    PieExample,
    PolarAreaExample,
    cTable
  },
  data() {
    return {
      game: {
        busyBalance: null,
        balance: null,
        reliableBalance: null,
      },
      busyBalance: null,
      reliableBalance: null,
      field: [        
        {key: 'balance', label: 'Balance'},
        {key: 'busyBalance', label: 'Busy Balance'},
        {key: 'reliableBalance', label: 'Reliable Balance'},
      ],
    }
  },
  methods: {
    async getBalance() {
      try {
        const balance = await ListRequest.getAllBalance({ account: process.env.VUE_APP_ACCOUNT_SMART_CONTRACT});
        this.game.busyBalance = balance.busyBalance;
        this.game.balance = balance.balance;
        this.busyBalance = this.game.busyBalance;
        this.reliableBalance = this.game.reliableBalance;
        this.game.reliableBalance = new BigNumber(this.game.balance).minus(this.game.busyBalance).toNumber();
      } catch (e) {
        console.log(e)
        Toast.alertHide(e, 5000, Const.dangerLevel, Const.alertTitle, this)
      }
    },
  },
  async created() {
    await this.getBalance()    
  },
}
</script>