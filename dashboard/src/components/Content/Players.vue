<template>
  <div id="container" :style="`height: ${containerHeight}px`">
    <div id="header">
      <h3>Connected players: {{ $store.state.stats.onlinePlayers }}</h3>
      <div>
        <label for="limit">Show </label>
        <select name="limit" id="limit" @change="updateList()" v-model="limit">
          <option v-for="option in limitOptions" :key="option" :value="option">
            {{ option }} entries
          </option>
        </select>
      </div>
    </div>
    <div id="content" :style="`height: ${containerHeight - 85}px`">
      <PlayerComponent
        v-for="player in players"
        :key="player.uuid"
        :name="player.username"
        :uuid="player.uuid"
        :role="player.role"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/runtime-core';
import PlayerComponent from '../Dashboard/Player.vue';
import { Player } from '../../store';

export default defineComponent({
  name: 'Players',
  components: { PlayerComponent },
  data: () => ({
    limit: 25,
    limitOptions: [25, 50, 75, 100, 150, 200, 300, 500],
    players: [] as Player[],
    containerHeight: 500,
  }),

  methods: {
    updateContainerHeight() {
      this.containerHeight = window.innerHeight - 90 - 68 - 25;
    },
    updateList() {
      // @ts-ignore
      this.players = [...this.$store.state.players];
      this.players.length = this.limit;
      this.players = this.players.filter((p) => p);
    },
  },

  created() {
    this.updateContainerHeight();
    window.addEventListener('resize', this.updateContainerHeight);
    this.updateList();
  },
});
</script>

<style scoped>
div#container {
  background-color: #ffffff;
  border-radius: 20px;
  box-shadow: 0px 18px 32px rgba(208, 210, 218, 0.15);
  margin: 50px 0 0 60px;
  width: 85%;
}

div#header {
  padding: 25px;
  display: flex;
  justify-content: space-between;
}

select {
  border-radius: 10px;
}

div#content {
  height: 80%;
  overflow-y: scroll;
}

div#content::-webkit-scrollbar {
  display: none;
}
</style>
