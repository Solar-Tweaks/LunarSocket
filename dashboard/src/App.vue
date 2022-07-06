<template>
  <div>
    <Sidebar v-if="loggedIn" />
    <div id="content-container" v-if="loggedIn">
      <Header />
      <Content />
    </div>
    <Login v-else />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Login from './components/Login.vue';
import Sidebar from './components/Sidebar.vue';
import Header from './components/Header.vue';
import Content from './components/Content/Content.vue';
import { isKeyValid, fetchStats, fetchPlayers } from './api';
import store from './store';

export let checkKeyAndProceed: (key: string) => Promise<void>;

export default defineComponent({
  name: 'App',
  components: { Sidebar, Header, Content, Login },
  data: () => ({
    loggedIn: false,
  }),

  methods: {
    async checkKeyAndProceed(key: string): Promise<void> {
      const valid = await isKeyValid(key);

      if (valid) {
        this.loggedIn = true;
        localStorage.setItem('apiKey', key);
        store.commit('setApiKey', key);
        await Promise.all([fetchStats(), fetchPlayers()]);
      } else {
        alert('Your key is invalid');
        localStorage.removeItem('apiKey');
      }
    },
  },

  async created() {
    checkKeyAndProceed = this.checkKeyAndProceed;
    // @ts-ignore
    if (!this.$store.state.apiKey) {
      const key = localStorage.getItem('apiKey');
      if (!key) return;
      await this.checkKeyAndProceed(key);
    }
  },
});
</script>

<style>
* {
  --color-orange: #ff6a00;
  --color-blue: #551fff;
  --color-light-blue: #00b7fe;
  --color-red: #fd2254;
  --color-black: #15192c;
  --color-dark-gray: #92959e;
  --color-gray: #d0d2da;
  --color-light-gray: #f5f5f7;
  --color-background: #f8f9fc;

  margin: 0;
  padding: 0;

  font-family: 'Inter', sans-serif;
  color: var(--color-black);
  font-size: 20px;
  line-height: 28px;
}

body {
  background-color: var(--color-background);
}

div#content-container {
  margin-left: 15%;
}
</style>
