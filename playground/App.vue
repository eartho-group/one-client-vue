<template>
  <h1 class="mb-5">Eartho Vue Playground</h1>

  <div v-if="!isLoading">
    <router-link to="/" class="btn" data-cy="home-menu">Home</router-link>
    <router-link to="/profile" class="btn" data-cy="profile-menu"
      >Profile</router-link
    >
    <div class="mt-3">
      <router-view />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useEartho } from '../src';

export default defineComponent({
  setup() {
    const { isLoading } = useEartho();

    return { isLoading };
  }
});
</script>
