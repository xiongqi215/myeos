<template>
    <el-menu
      :router="true"
      :default-active="defaultActive"
      class="aside-main"
      text-color="#263C4F"
      background-color="#FFFFFF"
      active-text-color="#2a77cb">
      <div class="logo">
        <h1>MY EOS</h1>
      </div>
      
       <el-menu-item index="2" :route="{path: 'account'}">
        <i class="el-icon-bank-card"></i>
        <span slot="title">账户</span>
      </el-menu-item>
      <el-menu-item index="3" :route="{path: 'wallet'}">
        <i class="el-icon-wallet"></i>
        <span slot="title">钱包</span>
      </el-menu-item>
      <!-- <el-menu-item index="4" :route="{path: 'producers'}">
        <i class="el-icon-cpu"></i>
        <span slot="title">生产</span>
      </el-menu-item> -->
      <el-menu-item index="5" :route="{path: 'setting'}">
        <i class="el-icon-setting"></i>
        <span slot="title">设置</span>
      </el-menu-item>
       <el-menu-item index="6" :route="{path: 'keyTool'}">
        <i class="el-icon-plus"></i>
        <span slot="title">密钥生成</span>
      </el-menu-item>
       <el-menu-item index="99" @click="lockWallet">
        <i class="el-icon-lock"></i>
        <span slot="title">锁定钱包</span>
      </el-menu-item>
    </el-menu>
</template>

<script>
import {mapActions} from 'vuex'

export default {
  name: 'asideContent',
  data () {
    return {
      defaultActive: '0'
    }
  },
  mounted () {
    this.setActiveBar()
  },
  methods: {
     ...mapActions([
      'setlogout',
    ]),
    setActiveBar () {
      let path = ['createkeys', 'account', 'wallet', 'producers', 'setting']
      this.defaultActive = path.indexOf(this.$router.currentRoute.name).toString()
    },lockWallet(){
      this.setlogout();
       this.$router.push( {path: '/login'})
    }
  },
  watch: {
    '$route' () {
      this.setActiveBar()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.aside-main {
  height: 100vh;
  position: fixed;
}
.logo {
  text-align: center;
  background-color: #fff;
  width: 300px;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  box-shadow: 0 5px 7px 0 rgba(0,0,0,0.06);
}
.logo img{
  width: 60px;
}
.header-logo {
  height: 56px;
  line-height: 56px;
  padding: 0 20px;
  text-align: center;
  margin-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
}
.el-menu-item:focus, .el-menu-item:hover {
  background-color: #f6f7fb !important;
}
</style>
