<template>
  <div class="nav-container mb-3">
    <nav class="navbar navbar-expand-md navbar-light bg-light">
      <div class="container">
        <div class="navbar-brand logo"></div>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav"
          aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav mr-auto">
            <li class="nav-item">
              <router-link to="/" class="nav-link">Home</router-link>
            </li>
          </ul>
          <ul class="navbar-nav d-none d-md-block">
            <li v-if="!isConnected && !isLoading" class="nav-item">
              <button id="qsLoginBtn" class="btn btn-primary btn-margin" @click.prevent="login">Login</button>
            </li>

            <li class="nav-item dropdown" v-if="isConnected">
              <a class="nav-link dropdown-toggle" href="#" id="profileDropDown" data-toggle="dropdown">
                <img :src="user.photoURL" alt="User's profile picture" class="nav-user-profile rounded-circle"
                  width="50" />
              </a>
              <div class="dropdown-menu dropdown-menu-right">
                <div class="dropdown-header">{{ user.name }}</div>
                <router-link to="/profile" class="dropdown-item dropdown-profile">
                  <font-awesome-icon class="mr-3" icon="user" />Profile
                </router-link>
                <a id="qsLogoutBtn" href="#" class="dropdown-item" @click.prevent="logout">
                  <font-awesome-icon class="mr-3" icon="power-off" />Log out
                </a>
              </div>
            </li>
          </ul>

          <ul class="navbar-nav d-md-none" v-if="!isConnected && !isLoading">
            <button id="qsLoginBtn" class="btn btn-primary btn-block" @click="login">Log in</button>
          </ul>

          <ul id="mobileAuthNavBar" class="navbar-nav d-md-none d-flex" v-if="isConnected">
            <li class="nav-item">
              <span class="user-info">
                <img :src="user.photoURL" alt="User's profile picture"
                  class="nav-user-profile d-inline-block rounded-circle mr-3" width="50" />
                <h6 class="d-inline-block">{{ user.name }}</h6>
              </span>
            </li>
            <li>
              <font-awesome-icon icon="user" class="mr-3" />
              <router-link to="/profile">Profile</router-link>
            </li>

            <li>
              <font-awesome-icon icon="power-off" class="mr-3" />
              <a id="qsLogoutBtn" href="#" class @click.prevent="logout">Log out</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </div>
</template>

<script lang="ts">
import { useEarthoOne } from '@eartho/one-client-vue';
import authConfig from "../../auth_config.json";

export default {
  name: "NavBar",
  setup() {
    const eartho = useEarthoOne();
    console.log("aaa");

    return {
      isConnected: eartho.isConnected,
      isLoading: eartho.isLoading,
      user: eartho.user,
      login() {
        eartho.connectWithPopup({
          accessId: authConfig.fallbackAccessId
        });
        // eartho.connectWithRedirect({
        //   accessId: "YOUR_EARTHO_ACCESS_ID"
        // });
      },
      logout() {
        eartho.logout({
          
        });
      }
    }
  }
};
</script>

<style>
#mobileAuthNavBar {
  min-height: 125px;
  justify-content: space-between;
}
</style>
