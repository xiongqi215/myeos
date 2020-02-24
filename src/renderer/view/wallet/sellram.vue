<template>

  <el-row class="container">
    <el-col :xs="24" :sm="22" :lg="14">
      <el-card>
        <h3>出售ram，单位为字节(Bytes)</h3>
        <el-form :model="form" :rules="bytesRules" ref="form">
          <el-form-item label="账户" prop="from">
           <el-select v-model="form.account" filterable placeholder="请选择账户"  @change="changePayer">
              <el-option v-for="item in accounts" :key="item._id" :label="item.acctName" :value="item._id"></el-option>
            </el-select>
           </el-form-item>
          <el-form-item label="出售大小 例:1024" prop="bytes">
            <el-input v-model.number="form.bytes" type="number" placeholder="出售ram，单位为：bytes且必须为整数"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSubmit('form')">确定出售</el-button>
             <el-button type="ghost" @click="resetForm('form')">重置表单</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </el-col>

    <el-col :xs="24" :sm="22" :lg="8" class="aside-spaceing">
      <el-card style="color: #909399;">
        <h3 style="color: #2c3e50;">提示：</h3>
        <ol>
          <li>账号格式 1-5 a-z</li>
          <li>单位为 bytes</li>
          <li>bytes必须大于 0</li>
        </ol>
      </el-card>

       <el-card style="color: #909399;"  v-loading="loadingRammarket">
        <h3 style="color: #2c3e50;">当前内存价格：{{ramPrice}}</h3>
        <p style="font-size: 13px;color: #999;">购买 1KB 内存 需要花费的通证数量</p>
      </el-card>
    </el-col>
  </el-row>

</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'buyram',
  data () {
    let validateAccountName = function (rule, val, cb) {
      let re = /^[1-5a-z]+$/g
      if (val === '') {
        cb(new Error('请输入账户名'))
      } else if (!re.test(val)) {
        cb(new Error('名字只能包含 1-5 a-z ！'))
      } else {
        cb()
      }
    }
    return {
      accounts:[],
      loadAcct:false,
      loadingRammarket:false,
      ramPrice:'',
      form: {
        account: '',
        bytes: 1024
      },
      selectedAcct:{
        httpEndpoint:'',
        acctName:'',
      },
      bytesRules: {
        account: {required: true, validator: validateAccountName, trigger: 'blur'},
        bytes: {required: true, message: '请输入', trigger: 'blur'}
      },
 
    }
  },
  methods: {
       async changePayer (id) {
       try{
          let acctInfo = await this.$walletdb.findOne({doc:'acct',_id:id})
          let chainInfo=await this.$walletdb.findOne({doc:'netconfig',_id:acctInfo.chain_id})
          this.selectedAcct.acctName=acctInfo.acctName;
          this.selectedAcct.httpEndpoint=chainInfo.httpEndpoint;
          this.selectedAcct.privateKey=acctInfo.privKey;
          this.loadRammarket(chainInfo.httpEndpoint)
       }catch(error){
              console.error(error)
            this.$message.error('查询失败')
       }
          
    },
     
async loadAccountFromDb(){
         this.accounts=[];
         let docs=await this.$walletdb.find({doc:'acct'})
          
            if(!docs||docs.length===0){
                }else{
                  for(let item of docs){
                   
                     let chainInfo=await this.$walletdb.findOne({doc:'netconfig',_id:item.chain_id})
                            if(chainInfo){
                              item.chainName=chainInfo.chainName;
                            }
                  }
                  this.accounts=docs
                }
     },
      async loadRammarket(httpEndpoint){
        this.loadingRammarket=true;
         let rpc = new this.$eosjs.JsonRpc (httpEndpoint)
         let res=await rpc.get_table_rows({"json":true,"code":"eosio","scope": "eosio","table":"rammarket"})
        let quote = res.rows[0].quote.balance.split(' ');
        let quote_balance=parseFloat(quote[0])
        let quote_symbol=quote[1]

        let base = res.rows[0].base.balance.split(' ');
        let base_balance=parseFloat(base[0])
        let base_symbol=base[1]

        this.ramPrice=(quote_balance/(base_balance / 1024)).toFixed(4)
        this.ramPrice=`${this.ramPrice} ${quote_symbol}/KB`
        this.loadingRammarket=false;
       
      },
    handleSubmit (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.openFullScreenLoading()
          this.sellram()
        } else {
          this.$message.warning('填写有误')
          console.log('error submit!!')
          return false
        }
      })
    },
     async sellram () {
          let privateKey=this.selectedAcct.privateKey;
         this.openFullScreenLoading()
           try{
               let rpc = new this.$eosjs.JsonRpc (this.selectedAcct.httpEndpoint)
               let signatureProvider = new this.$JsSignatureProvider([privateKey]);
               let api = new this.$eosjs.Api({ rpc, signatureProvider });
               let data={
                      actions: [{
                        account: 'eosio',
                        name: 'sellram',
                        authorization: [{
                          actor: this.selectedAcct.acctName,
                          permission: 'active',
                        }],
                        data: {
                          account: this.selectedAcct.acctName,
                          bytes: this.form.bytes,
                        },
                      }]
                    }
                   let res = await api.transact(data,{
                      broadcast:true,
                      blocksBehind: 3,
                      expireSeconds: 120,
                    });
                  console.info(res)
                  let { transaction_id } = res
                  this.loading.close()
                  this.$notify({
                      title: '出售成功',
                      message: ` <p>交易ID"${transaction_id}"</p><p>接下来可以前往查看浏览器操作详情</p> `,
                      duration: 4000,
                      type: 'success',
                      dangerouslyUseHTMLString: true
                  }) 
             }catch(error){
              console.info(error);
              this.loading.close()
              this.$notify({
                  title: '出售失败',
                  message: `<p>可能的原因</p><ol> <li>接收账户不存在</li><li>账户余额不足</li></ol>`,
                  duration: 4000,
                  type: 'error',
                  dangerouslyUseHTMLString: true
              })
           }
    },
    resetForm (formName) {
      this.$refs[formName].resetFields()
    },
  },
  created(){
     this.loadAccountFromDb();
    //  this.loadRemmarket();
 },
  computed: {
    ...mapState({
      eosConfig: state => state.eosConfig,
      eos: state => state.eos
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.el-card + .el-card {
  margin-top: 20px;
}
.container {
  margin-top: 20px;
}

@media (min-width: 1200px) {
  .aside-spaceing {
    margin-left: 20px;
  }
}
@media (max-width: 1200px) {
  .aside-spaceing {
    margin-top: 20px;
  }
}
</style>
