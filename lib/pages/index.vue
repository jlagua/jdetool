<template>
  <div>
    <nav class="navbar navbar-light bg-light">
      <span class="navbar-brand mb-0 h1">Le bel outil JDE</span>
    </nav>
    <div class="container">
      <div class="row">
        <div class="col-xs-12">
          <button type="button" class="btn btn-primary" @click="refreshData" :disabled="isRefreshing">
            <div class="text-center">
              <div v-if="isRefreshing" class="spinner-border" role="status">
                <span class="sr-only">Loading...</span>
              </div>
              <div v-else>
                Mettre à jour les stats
              </div>
            </div>
          </button>
        </div>
      </div>
      <div class="row">
        <div class="col-xs-12">
          <div v-if="!isRefreshing&&players">
            <Grid
              ref="grid"
              :style="{height: '800px'}"
              :data-items="gridData"
              :sortable="true"
              :pageable="gridPageable"
              :groupable="true"
              :group="group"
              :take="take"
              :skip="skip"
              :filterable="true"
              :filter="filter"
              :sort="sort"
              :columns="columns"
              @datastatechange="onDataStateChange">
            </Grid>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { process } from '@progress/kendo-data-query'

export default {
  data: () => {
    return {
      isRefreshing: false,
      filter: null,
      sort: null,
      gridPageable: { pageSizes: true },
      gridData: [],
      skip: 0,
      take: 10,
      group: [ { field: 'position' } ],
      columns: [
        { field: 'name', title: 'Nom' },
        { field: 'price', title: 'Prix (M)' },
        { field: 'position', title: 'Position' },
        { field: 'team', title: 'Equipe' },
        { field: 'value', title: 'Ratio' },
        { field: 'pointsPerGame', title: 'Points JDE' },
        { field: 'minutesPerGame', title: 'Minutes' }
      ]
    }
  },
  methods: {
    refreshData: async function () {
      this.isRefreshing = true
      await axios.post('/api/contests/players/update', {})
      const response = await axios.get('/api/players')
      this.players = response.data
      this.isRefreshing = false
    },
    getData: function () {
      this.gridData = process(this.players, {take: this.take, skip: this.skip, group: this.group, sort: this.sort, filter: this.filter})
    },
    createAppState: function(dataState) {
      this.group = dataState.group;
      this.take = dataState.take;
      this.skip = dataState.skip;
      this.filter = dataState.filter;
      this.sort = dataState.sort;
      this.getData();
    },
    onDataStateChange: function (event) {
      this.createAppState(event.data);
    }
  },
  async asyncData(context) {
    const response = await axios.get(`${context.env.baseUrl}/api/players`)
    return {
      players: response.data.map((player) => {
        return {
            name: player.name,
            price: Number(player.price),
            position: player.position,
            team: player.team,
            minutesPerGame: Number(player.minutesPerGame),
            pointsPerGame: Number(player.pointsPerGame),
            value: Number(player.value)
        }
      })
    }
  },
  created: function() {
    this.getData()
  }
}
</script>
