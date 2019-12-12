<template>
  <b-card>
    <div slot="header" v-html="caption"></div>
    <b-table :dark="dark" :hover="hover" :striped="striped" :bordered="bordered" :small="small" :fixed="fixed" responsive="sm" :items="items" :fields="captions" :current-page="currentPage" :per-page="perPage" @row-clicked="rowClicked">
      <template slot="state" slot-scope="data">
        <b-badge :variant="getBadge(data.item.state)">{{data.item.state}}</b-badge>
      </template>    
    </b-table>
    <nav v-if="isPaging">
      <b-row>
        <b-col>
          <b-button :disabled="currentPage === 1" @click="prev" block variant="primary">Prev</b-button>
        </b-col>
        <b-col>
          <b-button :disabled="!more" @click="next" block variant="primary">Next</b-button>   
        </b-col>        
      </b-row>   
      <!-- <b-pagination :total-rows="totalRows" :per-page="perPage" v-model="currentPage" prev-text="Prev" next-text="Next" hide-goto-end-buttons/> -->
    </nav>
  </b-card>
</template>

<script>


export default {
  name: 'c-table',
  inheritAttrs: false,
  props: {
    more: {
      type: Boolean,
      default: false
    },    
    isPaging: {
      type: Boolean,
      default: true
    },
    caption: {
      type: String,
      default: 'Table'
    },
    hover: {
      type: Boolean,
      default: false
    },
    striped: {
      type: Boolean,
      default: false
    },
    bordered: {
      type: Boolean,
      default: false
    },
    small: {
      type: Boolean,
      default: false
    },
    fixed: {
      type: Boolean,
      default: false
    },
    tableData: {
      type: [Array, Function],
      default: () => []
    },
    fields: {
      type: [Array, Object],
      default: () => []
    },
    perPage: {
      type: Number,
      default: 10
    },
    dark: {
      type: Boolean,
      default: false
    },
    currentPage: {
      type: Number,
      default: 1      
    }
  },
  computed: {
    items: function() {
      const items =  this.tableData
      return Array.isArray(items) ? items : items()
    },
    captions: function() { return this.fields }
  },
  methods: {
    getBadge (status) {
      return status === 4 ? 'success'
        : status === 3 ? 'secondary'
          : status === 2 ? 'warning'
            : status === 1 ? 'danger' : 'primary'
    },
    rowClicked (item) {
      this.$emit('row-clicked', item)
    },
    compact (txid) {
      return txid.substring(0, 7) + '...';
    },
    next () {
      this.$emit('next', ++this.currentPage);
    },
    prev () {
      this.$emit('prev', --this.currentPage);
    },        
  }
}
</script>
