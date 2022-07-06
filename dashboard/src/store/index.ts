import { createStore } from 'vuex';
// @ts-ignore
import { updateGraphs } from '../components/Content/Main.vue';

export default createStore({
  state: {
    activeTab: '',
    apiKey: '',
    stats: {
      uptime: 'Loading',
      onlinePlayers: 'Loading',
      uniquePlayers: 'Loading',
      lunarLatency: 'Loading',
      averageConnected: 'Loading',
      events: [],
      onlineGraph: {},
      rankRepartition: {},
      status: {
        ramUsage: {
          used: 3400,
          max: 8192,
        },
        cpuUsage: {
          used: 69,
          max: 100,
        },
        diskSpace: {
          used: 123,
          max: 1000,
        },
      },
    },
    players: [] as Player[],
  },
  mutations: {
    setActiveTab(state, tab) {
      state.activeTab = tab;
    },
    setApiKey(state, apiKey) {
      state.apiKey = apiKey;
    },
    setStats(state, stats) {
      state.stats = stats;
      updateGraphs();
    },
    setPlayers(state, players: Player[]) {
      state.players = players;
    },
  },
});

export interface Player {
  uuid: string;
  name: string;
  role: string;
}
