<template>
  <div class="container">
    <div class="infos">
      <h5>{{ name }}</h5>
      <p>{{ uuid }}</p>
      <h6>{{ role }}</h6>
    </div>
    <div class="actions">
      <div
        class="player-action"
        style="background-color: rgba(253, 34, 84, 0.1)"
        @click="sendMessage()"
      >
        <i class="fa-solid fa-message" style="color: rgb(253, 34, 84)"></i>
      </div>
      <div
        class="player-action"
        style="background-color: rgba(85, 31, 255, 0.1)"
        @click="setRole()"
      >
        <i class="fa-solid fa-user-gear" style="color: rgb(85, 31, 255)"></i>
      </div>
    </div>
  </div>
</template>

<script alng="ts">
import { defineComponent } from '@vue/runtime-core';
import { sendMessage, setRole } from '../../api';

export default defineComponent({
  name: 'Player',
  props: {
    name: String,
    uuid: String,
    role: String,
  },

  methods: {
    async sendMessage() {
      const message = prompt(
        `What message do you want to send to ${this.$props.name}?`
      );
      await sendMessage(this.$props.uuid, message);
    },
    async setRole() {
      const role = prompt(
        `What role do you want to set for ${this.$props.name}?`
      );
      await setRole(this.$props.uuid, role);
    },
  },
});
</script>

<style scoped>
div.container {
  background-color: white;
  box-shadow: 0px 18px 32px rgba(208, 210, 218, 0.15);
  height: 60px;
  border-radius: 15px;
  margin: 5px 20px;
  display: flex;
}

div.infos {
  display: flex;
}

div.infos > *,
div.actions > * {
  margin: auto 0 auto 0;
  text-align: center;
}

div.infos > h5 {
  font-weight: normal;
  width: 250px;
}

div.infos > p {
  color: var(--color-dark-gray);
  font-size: 16px;
  width: 400px;
}

div.infos > h6 {
  font-weight: normal;
  width: 200px;
}

div.actions {
  display: flex;
}

div.player-action {
  cursor: pointer;
  width: 50px;
  height: 50px;
  border-radius: 16px;
  margin-right: 15px;
}

div.player-action > i {
  margin-top: 16px;
}
</style>
