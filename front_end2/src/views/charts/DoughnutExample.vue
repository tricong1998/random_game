<script>
import { Doughnut } from 'vue-chartjs'
import ListRequest from '@/core/request/ListRequest'
import BigNumber from 'bignumber.js'
import Toast from '../../core/base/Toast';
import Const from '../../core/base/Const';

export default {
  extends: Doughnut,
  data() {
    return {
      busy: null,
      reliable: null
    }
  },
  methods: {
    async getBalance() {
      try {
        const balance = await ListRequest.getAllBalance({ account: process.env.VUE_APP_ACCOUNT_SMART_CONTRACT});
        this.busy = balance.busyBalance;        
        this.reliable = new BigNumber(balance.balance).minus(this.busy).toNumber();
      } catch (e) {
        Toast.alertHide(e.toString(), 5000, Const.dangerLevel, Const.alertTitle, this)
      }
    },    
  },
  async created() {
    await this.getBalance();
    this.renderChart({
      labels: ['Reliable', 'Busy'],
      datasets: [
        {
          backgroundColor: [
            '#41B883',
            '#E46651',
          ],
          data: [this.reliable, this.busy]
        }
      ]
    }, {responsive: true, maintainAspectRatio: true})    
  },

}
</script>
