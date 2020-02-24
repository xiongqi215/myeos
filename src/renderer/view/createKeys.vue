<template>
  <div class="container">
    <el-row>
      <el-col :xs="24" :sm="22" :lg="14" :push="1">
        <el-card
          class="card-item"
          v-loading="loading"
          element-loading-text="计算中"
          >
          <p>账户：{{ key.acctName }}</p>
          <p>公钥：{{ key.pubKeys }}</p>
          <p>私钥：{{ key.priKeys }}</p>
        </el-card>
        <el-card class="card-item">
          <div slot="header" class="clearfix">
            <h1>通过种子创建秘钥对<span style="color: #BE6A77;">（推荐）</span></h1>
          </div>
          <el-form label-width="120">
            <el-form-item>
              <el-input v-model="seed" placeholder="同一个种子每次产生相同的私钥"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button @click="createKeyBySeed">创建秘钥对</el-button>
            </el-form-item>
          </el-form>
        </el-card>
        <el-card class="card-item">
          <div slot="header" class="clearfix">
            <h1>随机创建秘钥对</h1>
          </div>
          <el-form label-width="120">
            <el-form-item>
              <el-button @click="createKeyByRandom">创建秘钥对</el-button>
               <el-button @click="createAcNameByRandom">创建随机账户名</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="22" :lg="6" :push="1" class="aside-spaceing">
        <el-card style="color: #909399;">
          <h3 style="color: #2c3e50;">说明</h3>
          <ol>
            <li>种子（seed）：一个固定的字符串。可以是一句话，也可以是随机字符串，会产生一对固定EOS秘钥</li>
            <li>seed 使用的官方仓库 eosjs-ecc 来生成。</li>
          </ol>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'createkeys',
  data () {
    return {
      seed: '',
      key: {
        acctName:'',
        pubKeys: '',
        priKeys: ''
      },
      loading: false
    }
  },
  mounted () {
  },
  methods: {
    createKeyBySeed () {
      this.startLoading()
      if (this.seed.length < 128) {
        this.$notify(
          {
            title: '建议',
            message: '同一个种子每次产生相同的私钥。应该使用至少128个随机位来产生一个好的私钥。',
            offset: 80
          }
        )
      }
      this.key.priKeys = this.$ecc.seedPrivate(this.seed)
      this.key.pubKeys = this.$ecc.privateToPublic(this.key.priKeys)
      this.closeLoading()
    },
    createKeyByRandom () {
      this.startLoading()
      this.$ecc.randomKey().then(privateKey => {
        this.key.priKeys = privateKey
        this.key.pubKeys = this.$ecc.privateToPublic(privateKey)
        this.closeLoading()
      })
    },
    createAcNameByRandom(){
  　　let len = 12;
  　　let $chars = '12345abcdefghijklmnopqrstuvwxyz'; 
  　　let maxPos = $chars.length;
  　　let pwd = '';
    　　for (let i = 0; i < len; i++) {
    　　　　pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    　　}
      this.key.acctName=pwd;
    },
    startLoading () {
      this.loading = true
    },
    closeLoading () {
      setTimeout(() => {
        this.loading = false
      }, 500)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.card-item:nth-of-type(n) {
  margin-top: 20px;
}

h1 {
  margin: 0;
  color: #2c3e50;
}

.aside-spaceing {
  margin-top: 20px;
}

@media (min-width: 1200px) {
  .aside-spaceing {
    margin-left: 20px;
  }
}
</style>
