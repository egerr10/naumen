<template>
  <div class="body">

  <div class="search-body">
    <div class="logo-block">
      <a href="https://www.naumen.ru" target="_blank"><div class="n-logo"></div></a>
      <a href="https://ru.wikipedia.org/wiki/Naumen" target="_blank">
      <div class="w-logo"><img src="../assets/wikilogo.png" alt=""></div>
      </a>
    </div>

    <el-form :inline="true" @submit.native.prevent="getWiki" class="form-inline" status-icon>
      <el-input v-focus class="search-input" type="text" v-model="query"></el-input>
      <el-form-item>
        <el-button native-type="submit" size="medium" type="primary">Найти</el-button>
      </el-form-item>
    </el-form>

    <div id="example" v-if="exampleVisible" class="example-container">
      <div class="example-body">
      <div class="example-item" v-for="item in exampleResult" :key="item">
        <div v-on:click="setWord(item)">{{item}}</div>
      </div>
      </div>
      <div v-if="history.length" class="history-body">
        <div class="history-title">
          История поиска:
          <span v-on:click="deleteHistoryAll" class="history-delete">(очистить)</span>
        </div>
        <div class="history-body-item" v-for="(item, index) in history" v-bind:key="item">
          <div class="history-item" v-on:click="setWord(item)">{{item}}</div>
          <div class="history-item-delete" v-on:click="deleteHistoryItem(index)">x</div>
        </div>
      </div>
    </div>


    <div class="result-container">
      <div v-for="item in result" :key="item.pageid">
        <div class="item-container">
          <div class="item-link">
            <a v-bind:href="item.fullurl" target="_blank">{{ item.title }}</a>
          </div>
          <div class="item-ext">
            <div> <img v-if="item.thumbnail" v-bind:src="item.thumbnail.source" alt=""></div>
            <div class="item-ext-text" v-html="item.extract"></div>
          </div>
        </div>
      </div>
    </div>

  </div>
  </div>
</template>

<script>
/* eslint-disable no-console,prefer-destructuring */


import axios from 'axios';
import _ from 'lodash';
import JQuery from 'jquery';

const $ = JQuery;

export default {
  name: 'HelloNaumen',
  data() {
    const question = '';
    const query = '';
    const result = {};
    const history = [];
    const exampleResult = {};
    const exampleVisible = false;
    const loading = false;
    return {
      query, result, loading, question, exampleResult, exampleVisible, history,
    };
  },
  created() {
    this.debouncedGetAnswer = _.debounce(this.getWords, 200);
  },
  mounted() {
    $(document).mouseup((e) => {
      const div = $('#example');
      if (!div.is(e.target) && div.has(e.target).length === 0) {
        this.exampleVisible = false;
      }
    });
    if (!JSON.parse(localStorage.getItem('history'))) {
      localStorage.setItem('history', JSON.stringify(this.history));
    } else {
      this.history = JSON.parse(localStorage.getItem('history'));
    }
  },
  watch: {
    // эта функция запускается при любом изменении вопроса
    query() {
      this.exampleVisible = this.query !== ''; // если запрос не пустой показываем блок вариантов
      this.debouncedGetAnswer();
    },
  },
  methods: {
    checkHistory() {
      const word = this.query;
      const checkHistory = this.history.slice();
      for (let i = 0; i < checkHistory.length; i += 1) {
        checkHistory[i] = checkHistory[i].toLowerCase();
      }
      return checkHistory.indexOf(word.toLowerCase()) !== -1;
    },
    pushHistory() {
      if (this.history.length < 15 && !this.checkHistory() && this.query.length > 0) {
        this.history.unshift(this.query);
        this.saveHistory();
      } else if (this.history.length >= 15 && !this.checkHistory() && this.query.length > 0) {
        this.history.unshift(this.query);
        this.history.pop();
        this.saveHistory();
      }
    },
    saveHistory() {
      localStorage.setItem('history', JSON.stringify(this.history));
    },
    deleteHistoryAll() {
      this.history = [];
      this.saveHistory();
    },
    deleteHistoryItem(index) {
      this.history.splice(index, 1);
      this.saveHistory();
    },
    setWord(item) {
      this.query = item;
      this.getWiki();
    },
    getWords() {
      axios({
        url: `https://ru.wikipedia.org/w/api.php?origin=*&action=opensearch&search=${this.query}&format=json&limit=10`,
        method: 'GET',
      })
        .then((response) => {
          this.loading = false;
          this.exampleResult = response.data[1];
        })
        .catch((error) => {
          console.log(error);
        });
    },
    getWiki() {
      this.result = [];
      this.loading = true;
      this.exampleVisible = false;
      this.pushHistory();
      axios({
        url: `https://ru.wikipedia.org/w/api.php?origin=*&format=json&action=query&generator=search&gsrnamespace=0
        &gsrlimit=10&prop=pageimages|info|extracts&pilimit=max&exintro&exsentences=1&exlimit=max&gsrsearch=${this.query}&inprop=url`,
        method: 'GET',
      })
        .then((response) => {
          this.loading = false;
          this.exampleVisible = false;
          this.result = response.data.query.pages;
        })
        .catch((error) => {
          this.loading = false;
          console.log(error);
        });
    },
  },

};
</script>


<style>

  .body {
    margin: 125px auto 0;
    width: 1100px;
    display: -webkit-box;
    display: flex;
  }

  .logo-block {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    margin: 0 auto;
    width: 220px;
    padding-bottom: 25px;
  }

  .n-logo {
    background-image: url(https://www.naumen.ru/local/templates/naumen/images/svg/build/sprite.svg);
    display: block;
    background-color: transparent;
    background-size: 4865px 3930px;
    width: 179px;
    height: 20px;
    background-position: -2988px -2708px;
  }

  .w-logo {
    position: relative;
    bottom: 20px;
  }

  .history-body {
    float: right;
    width: 200px;
    padding: 10px;
  }

  .history-title {
    font-weight: 600;
    margin-bottom: 10px;
    font-size: 12px;
  }

  .history-body-item {
    margin-bottom: 10px;
    display: -webkit-box;
    display: flex;
  }

  .history-item, .history-item-delete, .history-delete {
    cursor: pointer;
    color: #237ace;
    text-decoration: none;
    font-size: 12px;
  }

  .history-item {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .history-delete {
    font-size: 10px;
  }

  .history-item-delete {
    margin-left: auto;
  }

  .history-item:hover,
  .history-item-delete:hover,
  .history-delete:hover {
    color: red;
  }

  .search-body {
    margin: 0 40px;
    width: 800px;
  }

  .form-inline {
    width: auto;
    text-align: left;
  }
  .search-input {
  }

  .el-form-item {
    display: inline-block;
    margin-left: 20px;
  }

  .result-container {
    text-align: left;
    width: 800px;
    margin-top: 30px;
  }

  .example-container {
    text-align: left;
    width: 648px;
    border: 1px solid #dcdfe6;
    border-top: none;
    position: absolute;
    background-color: white;
    display: -webkit-box;
    display: flex;
  }

  .example-body {
    padding: 10px 0;
    width: 600px;
  }

  .example-item {
    margin-bottom: 10px;
    padding: 0 15px;
    cursor: pointer;
  }

  .example-item:hover {
    background-color: #ebf5ff;
  }

  .example-item:last-child {
    margin-bottom: 0;
  }

  .el-input {
    width: 650px;
  }

  .el-form-item {
    margin-bottom: 0;
  }

  .item-container {
    margin-bottom: 30px;
  }

  .item-link {
  }

  .item-link a {
    font-size: 18px;
    color: #237ace;
    text-decoration: none;
  }

  .item-link a:hover {
    color: red;
  }

  .item-ext {
    display: -webkit-flex;
    display: flex;
    padding-top: 10px;
    -ms-flex-align: center!important;
    align-items: center!important;
  }

  .item-ext img {
    margin-right: 15px;
  }

  .item-ext-text p {
    margin: 0!important;
  }
</style>
