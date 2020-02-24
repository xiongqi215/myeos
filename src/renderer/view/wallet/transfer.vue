<template>

  <el-row class="container">
    <el-col :span="14">
      <el-card>
        <h2>转账</h2>
        <el-form :model="form" :rules="rules" ref="form" label-width="100px">
          <el-form-item label="转账账户" prop="from">
            <el-select v-model="form.from" filterable placeholder="请选择账户" @change="getCurrencyBalance">
              <el-option v-for="item in accounts" :key="item._id" :label="item.acctName" :value="item._id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="接收账户" prop="to">
            <el-input v-model="form.to" maxlength="12" placeholder="请输入接收账户名"></el-input>
          </el-form-item>
          <el-form-item label="转账通证" prop="token">
            <el-select v-model="form.token" filterable placeholder="请选择转账通证" >
              <el-option v-for="name in tokens" :key="name" :label="name" :value="name"></el-option>
            </el-select>          
          </el-form-item>
          <el-form-item label="转账数量" prop="quantity">
            <el-input v-model="form.quantity" placeholder="请输入通证数量，:2.0000，一定要带四位小数"></el-input>
          </el-form-item>
          <el-form-item label="备注（可选）">
            <el-input v-model="form.memo" placeholder="备注"></el-input>
          </el-form-item>
          <el-form-item label="广播（可选）">
            <el-radio v-model="options.broadcast" :label="true">true</el-radio>
            <el-radio v-model="options.broadcast" :label="false">false</el-radio>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSubmit('form')">确定转账</el-button>
            <el-button type="ghost" @click="resetForm('form')">重置表单</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </el-col>

   <el-col :xs="24" :sm="22" :lg="8" class="aside-spaceing">
      <el-card style="color: #909399;" v-loading="loadingBal">
        <h3 style="color: #2c3e50;">账户余额</h3>
        <el-form label-position="left" size="mini" inline>
          <el-form-item label="账户名">
            <el-input v-model="selectedAcct.acctName"  :readonly="true"></el-input>
          </el-form-item>

        </el-form>
        <hr>
        <ul v-if="currencyBalanceNum.length > 0">
          <li v-for="(item, index) in currencyBalanceNum" :key="index">
            <p>{{ item }}</p>
          </li>
        </ul>
        <p v-else>无</p>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
export default {
  name: 'wallet',
//   components: {
//     currencyBalance
//   },
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
      loading: null,
      form: {
        from: '',
        to: '',
        quantity: '',
        token:'',
        memo: new Date().toLocaleString('en')
      },
      selectedAcct:{
        httpEndpoint:'',
        acctName:'',
      },
      accounts:[],
      tokens:[],
      options: {
        broadcast: true
      },
      rules: {
        from: {required: true, message: '请选择转账账户', trigger: 'change'},
        to: {required: true, validator: validateAccountName, trigger: 'blur'},
        quantity: {required: true, message: '请输入要转的EOS数量', trigger: 'blur'}
      },
      loadingBal:false,
      currencyBalanceNum:[]
    }
  },
  methods: {
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
     async getCurrencyBalance (id) {
       try{
        this.loadingBal=true;
        let acctInfo = await this.$walletdb.findOne({doc:'acct',_id:id})
        console.info(acctInfo)
        let chainInfo=await this.$walletdb.findOne({doc:'netconfig',_id:acctInfo.chain_id})
        console.info(chainInfo)
        let rpc = new this.$eosjs.JsonRpc (chainInfo.httpEndpoint)
        let res = await rpc.get_currency_balance('eosio.token', acctInfo.acctName)
        this.currencyBalanceNum = res;
        console.info(this.currencyBalanceNum)
        this.tokens=[]
        for(let token of this.currencyBalanceNum){
            let token_symbol=token.split(' ')[1]
            this.tokens.push(token_symbol)
        }
        this.loadingBal=false;
        this.selectedAcct.acctName=acctInfo.acctName;
        this.selectedAcct.httpEndpoint=chainInfo.httpEndpoint;
        this.selectedAcct.privateKey=acctInfo.privKey;
       }catch(error){
              console.error(error)
            this.$message.error('查询失败')
            this.loadingBal=false;
       }
          
    },
      async transferToken () {
         let privateKey=this.selectedAcct.privateKey;
         this.openFullScreenLoading()
         try{
         let rpc = new this.$eosjs.JsonRpc (this.selectedAcct.httpEndpoint)
         let signatureProvider = new this.$JsSignatureProvider([privateKey]);
         let api = new this.$eosjs.Api({ rpc, signatureProvider });
         let data={
                      actions: [{
                        account: 'eosio.token',
                        name: 'transfer',
                        authorization: [{
                          actor: this.selectedAcct.acctName,
                          permission: 'active',
                        }],
                        data: {
                          from: this.selectedAcct.acctName,
                          to: this.form.to,
                          quantity: `${this.form.quantity} ${this.form.token}`,
                          memo: this.form.memo,
                        },
                      }]
                    }
          console.info(data);
         let result = await api.transact(data,{
                      broadcast:this.options.broadcast,
                      blocksBehind: 3,
                      expireSeconds: 30,
                    });
             console.info(result);
             let { transaction_id } = result
                          this.loading.close()
                          this.$notify({
                              title: '转账成功',
                              message: ` <p>交易ID"${transaction_id}"</p><p>接下来可以前往查看浏览器操作详情</p> `,
                              duration: 4000,
                              type: 'success',
                              dangerouslyUseHTMLString: true
                          })

         }catch(error){
             console.error(error);
                    this.loading.close()
                    this.$notify({
                        title: '转账失败',
                        message: `<p>可能的原因</p><ol><li>接收账户不存在</li> <li>账户余额不足</li></ol>`,
                        duration: 4000,
                        type: 'error',
                        dangerouslyUseHTMLString: true
                    })
             this.loading.close()
            return
        }
    },
    handleSubmit (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.openFullScreenLoading()
          this.transferToken()
        } else {
          this.$message.warning('填写有误')
          console.log('error submit!!')
          return false
        }
      })
    },
    resetForm (formName) {
      this.$refs[formName].resetFields()
    },

  },created(){
     this.loadAccountFromDb();
 },
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
