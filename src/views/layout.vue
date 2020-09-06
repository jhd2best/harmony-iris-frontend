<template>
  <div id="layout">
    <el-container>
    <el-header>
      <el-row>
        <el-col :lg="3" :xl="4" class="system-placeholder"></el-col>
        <el-col :span="4" style="padding-left: 15px;">
          <img :src="harmonyLogoSrc" alt="Harmony">
        </el-col>
      </el-row>
    </el-header>
    <el-main>
      <router-view></router-view>
    </el-main>
  </el-container>
  </div>
</template>

<script>
export default {
  name: "layout",
  components: {},
  data() {
    return {
      harmonyLogoSrc: require('../assets/harmony-logo.svg'),
    }
  },
  mounted: function () {
    
  },
  methods: {
  }
};
</script>

<style>
  body {
    margin: 0px;
    font-family: Nunito, sans-serif;
  }
  .el-container {
    padding: 0px 0px;
    width: 100vw;
    height: 100vh;
    overflow: auto;
    background-color: #d1dfe9;
  }
  .el-container .el-header {
    min-height: 80px;
    padding: 21px 0px;
    background-color: #ffffff;
  }
  .el-container .el-main {
    padding: 0px 0px;
  }
  .el-container .system-userinfo, .system-placeholder {
    text-align: right;
    border: 1px solid transparent;
  }
</style>
