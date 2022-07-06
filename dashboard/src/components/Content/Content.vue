<template>
  <component v-bind:is="$store.state.activeTab" />
</template>

<script>
import { defineComponent } from 'vue';
import Main from './Main.vue';
import Players from './Players.vue';

export default defineComponent({
  name: 'Content',

  components: {
    Main,
    Players,
  },
});
</script>
