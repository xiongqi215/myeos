<template>
  <div class="container">

 

   <el-row>
      <el-col :xs="24" :sm="22" :lg="22" :push="1">

           <el-tabs v-model="curr_tab">
            <el-tab-pane label="区块链管理" name="blockchains">
                <blockChain></blockChain>
            </el-tab-pane>
            <el-tab-pane label="钱包密码" name="walletPass">
              <walletPass></walletPass>
            </el-tab-pane>
          </el-tabs>

      </el-col>
    
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'setting',
    components: {
    'blockChain': () => import('./blockChain'),
    'walletPass': () => import('./walletPass'),

  },
  data () {
   
    return {
      curr_tab:"blockchains",
    }
  },
  methods: {
   
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.el-card + .el-card {
  margin-top: 20px;
}
@media (max-width: 1199px) {
  .aside-spaceing {
    margin-top: 20px;
  }
}
@media (min-width: 1200px) {
  .aside-spaceing {
    margin-left: 20px;
  }
}
</style>
