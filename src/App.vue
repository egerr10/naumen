<template>
  <el-container class="app" v-bind:class="{ default: !changeTheme, dark: changeTheme, }" id="app">
    <el-header height="0">
      <div title="Сменить тему" class="theme">
        <div class="them-item-body">
          <div class="theme-item-inner" v-bind:class="{ default: changeTheme, dark: !changeTheme, }"
               v-on:click="test"></div>
        </div>
      </div>
    </el-header>
    <el-main>
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<script>
/* eslint-disable no-console,prefer-destructuring */

export default {
  name: 'App',
  data() {
    const defaultTheme = true;
    const darkTheme = false;
    const changeTheme = false;
    return {
      defaultTheme, darkTheme, changeTheme,
    };
  },
  methods: {
    test() {
      this.changeTheme = this.changeTheme === false;
    },
    def() {
      this.defaultTheme = true;
      this.darkTheme = false;
    },
    dark() {
      this.defaultTheme = false;
      this.darkTheme = true;
    },
  },
};
</script>

<style>
  body {
    margin: 0;
  }

  .app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    padding-bottom: 30px;
    min-height: 100vh;
  }

  .theme {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    width: 40px;
    position: absolute;
    top: 25px;
    right: 15px;
    z-index: 100;
  }

  .them-item-body {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    margin-right: 10px;
    border: 1px solid gray;
    padding: 3px;
    cursor: pointer;
  }

  .theme-item-inner {
    background-color: cadetblue;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    margin-right: 10px;
    border: 1px solid gray;
  }

  .default {
    background-color: white;
    color: #2c3e50;
  }

  .dark {
    background-color: #2c2c2c;
    color: #ffffff;
  }

  .dark a {
    color: #66b4ff!important;
  }


</style>
