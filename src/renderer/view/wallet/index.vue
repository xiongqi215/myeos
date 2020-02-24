<template>
  <div class="container">
    <el-row>
      <el-col :span="22" :push="1">
        <el-card>
          <el-button type="text" @click="currentTabCompnent = 'transfer'">转账</el-button>
          <el-button type="text" @click="currentTabCompnent = 'delegatebw'">抵押EOS</el-button>
          <el-button type="text" @click="currentTabCompnent = 'undelegatebw'">取消抵押EOS</el-button>
          <el-button type="text" @click="currentTabCompnent = 'buyram'">购买ram</el-button>
          <el-button type="text" @click="currentTabCompnent = 'sellram'">出售ram</el-button>
          <el-button type="text" @click="currentTabCompnent = 'createAc'">创建账户</el-button>
        </el-card>
        <transition name="fade" mode="out-in">
          <component :is="currentTabCompnent"></component>
        </transition>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'wallet',
  components: {
    'transfer': () => import('./transfer'),
    'buyram':()=> import('./buyram'),
    'sellram':()=> import('./sellram'),
    'delegatebw':()=>import('./delegatebw'),
    'undelegatebw':()=>import('./undelegatebw'),
    'createAc':()=>import('./createAc'),
    
  },
  data () {
    return {
      currentTabCompnent: 'transfer',
      loading: null,
      dialogVisible: false,
      showDialog:false,
    }
  },
  methods: {
   
  },
  computed: {
    ...mapState({
       eos: state => state.eos,
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
