<template>
  <el-row class="container">
    <el-col :xs="24" :sm="22" :lg="14">
      <el-card>
        <h3>取消抵押</h3>
        <el-form :model="form" :rules="rules" ref="form">
          <el-form-item label="账户" prop="from">
            <el-select v-model="form.from" filterable placeholder="请选择账户"  @change="changePayer">
              <el-option v-for="item in accounts" :key="item._id" :label="item.acctName" :value="item._id"></el-option>
              </el-option>
            </el-select>
          </el-form-item>
           </el-form-item>
             <el-form-item label="接受账户类型">
              <el-radio-group v-model="form.self" @change="changeSelf">
                <el-radio :label="true">本账户</el-radio>
                <el-radio :label="false">其他账户</el-radio>
              </el-radio-group>
          </el-form-item>
          <el-form-item label="接收账户" prop="receiver">
            <el-input maxlength="12" v-model="form.receiver" placeholder="字符范围 1-5 a-z" :disabled="form.self"></el-input>
          </el-form-item>
          <el-form-item label="取消抵押net数量" prop="unstake_net_quantity">
            <el-input v-model="form.unstake_net_quantity" placeholder="例: 1.0000 或 0.0000">
                                <template slot="append">EOS</template>
            </el-input>
          </el-form-item>
          <el-form-item label="取消抵押cpu数量" prop="unstake_cpu_quantity">
            <el-input v-model="form.unstake_cpu_quantity" placeholder="例: 1.0000 或 0.0000">
                                <template slot="append">EOS</template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSubmit('form')">确定取消抵押</el-button>
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
          <li>代币数量格式 数量+空格+符号</li>
          <li>代币数量需保留四位小数</li>
          <li>解除抵押后，资金将于三天后到账</li>
        </ol>
      </el-card>
    </el-col>

  </el-row>
</template>

<script>
export default {
  name: 'undelegatebw',
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
      form: {
        from: '',
        receiver: '',
        unstake_net_quantity: '',
        unstake_cpu_quantity: '',
        self:true
      },
      selectedAcct:{
        httpEndpoint:'',
        acctName:'',
      },
      rules: {
        from: {required: true, message: '请选择账户名', trigger: 'change'},
        receiver: {required: true, validator: validateAccountName, trigger: 'blur'},
        unstake_net_quantity: {required: true, message: '请输入抵押数量，例:1.0000 EOS', trigger: 'blur'},
        unstake_cpu_quantity: {required: true, message: '请输入抵押数量，例:1.0000 EOS', trigger: 'blur'}
      },
    }
  },
  methods: {
       async changePayer (id) {
       try{
        let acctInfo = await this.$walletdb.findOne({doc:'acct',_id:id})
        console.info(acctInfo)
        let chainInfo=await this.$walletdb.findOne({doc:'netconfig',_id:acctInfo.chain_id})
        console.info(chainInfo)
        // let rpc = new this.$eosjs.JsonRpc (chainInfo.httpEndpoint)
        // let res = await rpc.get_currency_balance('eosio.token', acctInfo.acctName)
        // this.currencyBalanceNum = res;
        // console.info(this.currencyBalanceNum)
        // this.tokens=[]
        // for(let token of this.currencyBalanceNum){
        //     let token_symbol=token.split(' ')[1]
        //     this.tokens.push(token_symbol)
        // }
        // this.loadingBal=false;
        this.selectedAcct.acctName=acctInfo.acctName;
        this.selectedAcct.httpEndpoint=chainInfo.httpEndpoint;
        this.selectedAcct.privateKey=acctInfo.privKey;

         if(this.form.self){
          this.form.receiver=this.selectedAcct.acctName
      }
       }catch(error){
              console.error(error)
            this.$message.error('查询失败')
       }
          
    },
     changeSelf(label){
         if(this.form.self){
          this.form.receiver=this.selectedAcct.acctName
          this.form.transfer=false
        }else{
          this.form.receiver=''
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
    handleSubmit (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.openFullScreenLoading()
          this.undelegatebw()
        } else {
          this.$message.warning('填写有误')
          console.log('error submit!!')
          return false
        }
      })
    },

    async undelegatebw () {
        let privateKey=this.selectedAcct.privateKey;
        this.openFullScreenLoading()
          try{
              let rpc = new this.$eosjs.JsonRpc (this.selectedAcct.httpEndpoint)
               let signatureProvider = new this.$JsSignatureProvider([privateKey]);
               let api = new this.$eosjs.Api({ rpc, signatureProvider });
               let data={
                      actions: [{
                        account: 'eosio',
                        name: 'undelegatebw',
                        authorization: [{
                          actor: this.selectedAcct.acctName,
                          permission: 'active',
                        }],
                        data: {
                          from: this.selectedAcct.acctName,
                          receiver: this.form.receiver,
                          unstake_net_quantity: `${this.form.unstake_net_quantity} EOS`,
                          unstake_cpu_quantity: `${this.form.unstake_cpu_quantity} EOS`,
                          transfer: false,
                        },
                      }]
                    }
                console.info(data);
                 let result = await api.transact(data,{
                      broadcast:true,
                      blocksBehind: 3,
                      expireSeconds: 120,
                    });
                console.info(result);
                let { transaction_id } = result
                          this.loading.close()
                          this.$notify({
                              title: '抵押成功',
                              message: ` <p>交易ID"${transaction_id}"</p><p>接下来可以前往查看浏览器操作详情</p> `,
                              duration: 4000,
                              type: 'success',
                              dangerouslyUseHTMLString: true
                          })          
              }catch(error){
                    console.info(error);
                    this.loading.close()
                    this.$notify({
                        title: '取消抵押失败',
                        message: `<p>可能的原因</p><ol><li>接收账户不存在</li><li>抵押数量不足</li></ol>`,
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
