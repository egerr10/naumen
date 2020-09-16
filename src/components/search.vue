<template>
  <div class="body">

    <el-row :gutter="10">
      <el-col :span="18">
        <div class="logo-block">
          <a title="https://www.naumen.ru" href="https://www.naumen.ru" target="_blank"><div class="n-logo"></div></a>
          <a title="https://ru.wikipedia.org/wiki/Naumen" href="https://ru.wikipedia.org/wiki/Naumen" target="_blank">
            <div class="w-logo"><img src="../assets/wikilogo.png" alt=""></div>
          </a>
        </div>
      </el-col>
      <el-col :span="18">
        <el-form :inline="true" @submit.native.prevent="getWiki" class="form-inline" status-icon>
          <el-autocomplete id="input"
                           :select-when-unmatched="true"
                           :clearable="true"
                           :trigger-on-focus="false"
                           popper-class="my-autocomplete"
                           v-model="query"
                           :fetch-suggestions="querySearch"
                           placeholder="Wiki поиск"
                           @focus="historyShow"
                           @select="handleSelect">
            <template slot-scope="{ item }">
              <div class="value">{{ item }}</div>
            </template>
          </el-autocomplete>
        </el-form>
        <div class="result-info" v-if="calc">Среднее количество
          символов в статье: {{calc}}</div>
        <div id="history" v-if="historyView" class="history-body">
          <div class="history-container">
            <div class="history-body-item" v-for="(item, index) in history" v-bind:key="item">
              <div class="history-item" v-on:click="getFromHistoryQuery(item)">{{item}}</div>
              <div class="history-item-delete" v-on:click="deleteHistoryQuery(index)">удалить</div>
            </div>
            <div v-on:click="deleteHistoryAll" class="history-title">
              Очистить историю поиска
            </div>
          </div>
        </div>
        <div class="fail" v-if="queryError">Поздравляем! Вы нашли то, чего в Википедии нет!</div>
      </el-col>
      <el-col :span="2">
        <el-button v-on:click="getWiki" size="medium" type="primary">Найти</el-button>
      </el-col>
    </el-row>
1 2 3
    <div class="search-body">
      <loading v-if="loading"></loading>
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
import JQuery from 'jquery';

const $ = JQuery;

export default {
  name: 'HelloNaumen',
  data() {
    const question = '';
    const query = '';
    const result = {};
    const history = [];
    const exampleResult = [];
    const historyView = false;
    const loading = false;
    const queryError = false;
    return {
      query, result, historyView, question, exampleResult, history, loading, queryError,
    };
  },
  created() {
    window.addEventListener('click', this.test);
  },
  mounted() {
    $(document).mouseup((e) => {
      const div = $('#input');
      const div2 = $('#history');
      if (!div.is(e.target) && div.has(e.target).length === 0
          && !div2.is(e.target) && div2.has(e.target).length === 0) {
        this.historyView = false;
      }
    });
    if (!JSON.parse(localStorage.getItem('history'))) {
      localStorage.setItem('history', JSON.stringify(this.history));
    } else {
      this.history = JSON.parse(localStorage.getItem('history'));
    }
  },
  computed: {
    calc() {
      let sum = 0;
      let count = 0;
      let averageValue = 0;
      for (const item in this.result) {
        if (Object.prototype.hasOwnProperty.call(this.result, item)) {
          sum += this.result[item].length;
          count += 1;
        }
      }
      averageValue = sum / count;
      return Math.round(averageValue);
    },
  },
  methods: {
    test(e) {
      // const el = document.querySelector('#test');
      console.log(e);
    },
    historyShow() { // отображаем историю запросов
      if (!this.query && this.history.length > 0) {
        this.historyView = true;
      }
    },
    handleSelect(item) { // запускаем функцию поиска по википедии
      if (item.value || item.value === '') {
        this.query = item.value;
      } else {
        this.query = item;
      }
      this.getWiki();
    },
    checkHistory() { // проверяем есть ли такой запрос в истории, если есть не добавляем
      const word = this.query;
      const checkHistory = this.history.slice();
      for (let i = 0; i < checkHistory.length; i += 1) {
        checkHistory[i] = checkHistory[i].toLowerCase();
      }
      return checkHistory.indexOf(word.toLowerCase()) !== -1;
    },
    pushHistory() { // добавляем запрос в историю
      this.query = this.query.trim();
      if (this.history.length < 15 && !this.checkHistory() && this.query.length > 0) {
        this.history.unshift(this.query);
        this.saveHistory();
      } else if (this.history.length >= 15 && !this.checkHistory() && this.query.length > 0) {
        this.history.unshift(this.query);
        this.history.pop();
        this.saveHistory();
      }
    },
    saveHistory() { // сохраняем в localStorage
      localStorage.setItem('history', JSON.stringify(this.history));
    },
    deleteHistoryAll() { // очищаем историю
      this.historyView = false;
      this.history = [];
      this.saveHistory();
    },
    deleteHistoryQuery(index) { // очищаем запрос из истории
      this.history.splice(index, 1);
      this.saveHistory();
    },
    getFromHistoryQuery(query) { // поиск по запросу из истории
      this.query = query;
      this.historyView = false;
      this.getWiki();
    },
    querySearch(query, cb) { // ищем ключевые слова
      this.historyView = false;
      axios({
        url: `https://ru.wikipedia.org/w/api.php?origin=*&action=opensearch&search=${this.query}&format=json&limit=20`,
        method: 'GET',
      })
        .then((response) => {
          this.exampleResult = response.data[1];
          cb(response.data[1]);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    getWiki() { // поиск по википедии
      this.query = this.query.trim();
      if (this.query.length > 0) {
        this.queryError = false;
        this.loading = true;
        this.result = [];
        this.pushHistory();
        axios({
          url: `https://ru.wikipedia.org/w/api.php?origin=*&format=json&action=query&generator=search&gsrnamespace=1
        &gsrlimit=20&prop=pageimages|info|extracts&pilimit=max&exintro&exsentences=1&exlimit=max&gsrsearch=${this.query}&inprop=url`,
          method: 'GET',
        })
          .then((response) => {
            this.loading = false;
            this.result = response.data.query.pages;
          })
          .catch((error) => {
            this.loading = false;
            this.queryError = true;
            console.log(error);
          });
      }
    },
  },
};
</script>


<style>
  .body {
    margin: 0 auto;
    max-width: 1000px;
    padding-top: 50px;
  }
  .logo-block {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    margin: 15px auto;
    width: 220px;
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
    padding: 10px;
    border: 1px solid #dcdfe6;
    position: relative;
    z-index: 10;
    background-color: white;
  }

  .history-container {
    width: 100%;
    border-top: none;
  }

  .history-body-item {
    margin-bottom: 10px;
    display: -webkit-box;
    display: flex;
  }
  .history-item, .history-item-delete, .history-title {
    cursor: pointer;
    color: #237ace;
    text-decoration: none;
    font-size: 14px;
  }

  .history-title {
    font-weight: 600;
    font-size: 12px;
    cursor: pointer;
  }

  .history-item {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .history-item-delete {
    margin-left: auto;
  }
  .history-item:hover,
  .history-item-delete:hover,
  .history-title:hover {
    color: red;
  }
  .search-body {
    margin: 0 auto;
  }
  .form-inline {
    width: auto;
    text-align: left;
    display: -webkit-flex;
    display: flex;

  }
  .el-form-item {
    display: inline-block;
    margin-left: 20px;
  }
  .result-container {
    text-align: left;
    width: 100%;
    margin-top: 50px;
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
    background-color: white;
  }
  .item-ext-text p {
    margin: 0!important;
  }

  .el-autocomplete-suggestion li.highlighted, .el-autocomplete-suggestion li:hover {
    background-color: #cde5ff;
  }

  .el-popper .popper__arrow, .el-popper .popper__arrow::after {
    border-style: hidden;
  }
  .el-autocomplete-suggestion__wrap {
    max-height: 400px;
  }

  .el-autocomplete {
    width: 100%;
  }

  .result-info {
    text-align: left;
    padding: 10px;
    position: absolute;
    z-index: 5;
    font-size: 14px;
  }
  .fail {
    margin-top: 22px;
    font-size: 18px;
    color: #6d6d6d;
  }

  @media screen and (max-width: 500px) {
    .body {
      padding-top: 0;
    }
    .history-item, .history-item-delete, .history-title {
      font-size: 12px;
    }
  }
</style>
