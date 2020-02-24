<template>
  <footer>
    <div>
      <!-- <p class="tips">节点地址：{{httpEndpoint}}</p>
      <p class="tips">网络ID:{{chainId}}</p>
      <p class="tips">区块高度:{{head_block_num}}</p>
      <p class="tips">不可逆区块高度:{{last_irreversible_block_num}}</p>
      <p class="tips">当前生产者:{{head_block_producer}}</p> -->
      <p class="tips"> power by electron-vue </p>
    </div>
  </footer>
</template>


<script>

export default {
  name: 'footerComponent',
  data () {
    return {
    }
  },
  
} 

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.tips {
  margin: 0;
  padding: 10px;
}
</style>
