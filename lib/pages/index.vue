<template>
  <div>
    <nav class="navbar navbar-light bg-light">
      <span class="navbar-brand mb-0 h1">Le bel outil JDE</span>
    </nav>
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
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
        <div class="col-sm-12">
          <div v-if="!isRefreshing&&players">
            <Grid
              ref="grid"
              :style="{height: '640px'}"
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
      <div class="row">
        <div class="col-sm-12">
          <h3>Equipe optimale</h3>
        </div>
        <div class="col-sm-6">
          <form>
            <div class="col-sm-4" v-for="team in Object.keys(teams)" :key="team">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" :id="'checkbox-' + team" v-model="teamsCheckboxes[team]">
                <label class="form-check-label" :for="'checkbox-' + team">{{team}}</label>
              </div>
            </div>
            <div class="col-sm-12">
              <div class="form-group">
                <label for="salaryMaxInput">Salaire disponible (M)</label>
                <input v-model="salaryMaxInput" type="number" class="form-control" id="salaryMaxInput" placeholder="">
              </div>
            </div>
            <button type="button" class="btn-secondary" @click="processTeam">Calculer</button>
          </form>
        </div>
        <div class="col-sm-6" v-if="optimalTeamResult">
          <ul class="list-group">
            <li class="list-group-item" v-for="player in optimalTeamResult.optimalTeam" :key="player.name">
              {{player.name}}, {{player.position}}, {{player.price}}M, {{player.points}}pts
            </li>
            <li class="list-group-item">
              Total: {{optimalTeamResult.totalPoints.toFixed(2)}}pts, {{optimalTeamResult.salaryLeft.toFixed(1)}}M restants
            </li>
          </ul>
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
      optimalTeamResult: null,
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
      ],
      teams: {
        ATL: 'Atlanta Hawks',
        BOS: 'Boston Celtics',
        BKN: 'Brooklyn Nets',
        CHA: 'Charlotte Hornets',
        CHI: 'Chicago Bulls',
        CLE: 'Cleveland Cavaliers',
        DAL: 'Dallas Mavericks',
        DEN: 'Denver Nuggets',
        DET: 'Detroit Pistons',
        GSW: 'Golden State Warriors',
        HOU: 'Houston Rockets',
        IND: 'Indiana Pacers',
        LAC: 'Los Angeles Clippers',
        LAL: 'Los Angeles LAkers',
        MEM: 'Memphis Grizzlies',
        MIA: 'Miami Heat',
        MIL: 'Milwaukee Bucks',
        MIN: 'Minnesota Timberwolves',
        NOP: 'New Orleans Pelicans',
        NYK: 'New York Knicks',
        OKC: 'Oklahoma City Thunder',
        ORL: 'Orlando Magic',
        PHI: 'Philadelphia 76ers',
        PHX: 'Phoenix Suns',
        POR: 'Portland Trail Blazers',
        SAC: 'Sacramento Kings',
        SAS: 'San Antonio Spurs',
        TOR: 'Toronto Raptors',
        UTA: 'Utah Jazz',
        WAS: 'Washington Wizards'
      },
      teamsCheckboxes: {
        ATL: true,
        BOS: true,
        BKN: true,
        CHA: true,
        CHI: true,
        CLE: true,
        DAL: true,
        DEN: true,
        DET: true,
        GSW: true,
        HOU: true,
        IND: true,
        LAC: true,
        LAL: true,
        MEM: true,
        MIA: true,
        MIL: true,
        MIN: true,
        NOP: true,
        NYK: true,
        OKC: true,
        ORL: true,
        PHI: true,
        PHX: true,
        POR: true,
        SAC: true,
        SAS: true,
        TOR: true,
        UTA: true,
        WAS: true,
      },
      salaryMaxInput: 85
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
    processTeam: async function () {
      const teams = Object.keys(this.teamsCheckboxes).filter((team) => this.teamsCheckboxes[team])
      const salaryMax = this.salaryMaxInput
      const response = await axios.post('/api/contests/optimal-team', {
        teams,
        salaryMax
      })
      this.optimalTeamResult = response.data
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
