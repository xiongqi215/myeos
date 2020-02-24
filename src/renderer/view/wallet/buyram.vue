<template>

  <el-row class="container">
    <el-col :xs="24" :sm="22" :lg="14">
      <el-card>
        <h3>购买ram</h3>
        <el-form :model="form" :rules="EOSRules" ref="form"  >
          <el-form-item label="账户" prop="from">
           <el-select v-model="form.from" filterable placeholder="请选择账户"  @change="changePayer">
              <el-option v-for="item in accounts" :key="item._id" :label="item.acctName" :value="item._id"></el-option>
            </el-select>
           </el-form-item>
           <el-form-item label="接受账户类型">
              <el-radio-group v-model="form.self" @change="changeSelf">
                <el-radio :label="true">本账户</el-radio>
                <el-radio :label="false">其他账户</el-radio>
              </el-radio-group>
          </el-form-item>
          <el-form-item label="接收账户" prop="receiver">
            <el-input
              maxlength="12"
              v-model="form.receiver"
              placeholder="字符范围 1-5 a-z" :disabled="form.self"></el-input>
          </el-form-item>
          <el-form-item label="购买单位" prop="unint">
            <el-select v-model="form.unint" filterable placeholder="请选择">
              <el-option
                v-for="unint in unints"
                :key="unint.code"
                :label="unint.name"
                :value="unint.code">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="购买数量" prop="quant">
            <el-input v-model="form.quant" placeholder="购买数量"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSubmit('form')">确定购买</el-button>
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
          <li>按EOS来购买时需保留四位小数 例：0.0001 EOS</li>
          <li>按bytes来购买时 单位为 bytes</li>
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
        cb(new Error('账户名只能包含 1-5 a-z ！'))
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
        payer: '',
        receiver: '',
        quant: '',// EOS quantity
        self: true,
        unint:"byte"
      },
       selectedAcct:{
        httpEndpoint:'',
        acctName:'',
      },
      unints: [
        { code:'bytes',name:'bytes'},
        { code:'EOS',name:'EOS'}

      ],
      EOSRules: {
        payer: {required: true, message: '请输入合约账户名', trigger: 'change'},
        receiver: {required: true, validator: validateAccountName, trigger: 'blur'},
        quant: {required: true, message: '请输入', trigger: 'blur'}
      },
    }
  },
  methods: {
    changeSelf(label){
         if(this.form.self){
          this.form.receiver=this.selectedAcct.acctName
          this.form.transfer=false
        }else{
          this.form.receiver=''
        }
    },
    async changePayer (id) {
       try{
        let acctInfo = await this.$walletdb.findOne({doc:'acct',_id:id})
        let chainInfo=await this.$walletdb.findOne({doc:'netconfig',_id:acctInfo.chain_id})
        this.selectedAcct.acctName=acctInfo.acctName;
        this.selectedAcct.httpEndpoint=chainInfo.httpEndpoint;
        this.selectedAcct.privateKey=acctInfo.privKey;

         if(this.form.self){
          this.form.receiver=this.selectedAcct.acctName
      }
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
         let rpc = new this.$eosjs.JsonRpc (this.selectedAcct.httpEndpoint)
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
         this.buyram()
        } else {
          this.$message.warning('填写有误')
          console.log('error submit!!')
          return false
        }
      })
    },
    async buyram () {
        let privateKey=this.selectedAcct.privateKey;
         this.openFullScreenLoading()
           try{
                let rpc = new this.$eosjs.JsonRpc (this.selectedAcct.httpEndpoint)
               let signatureProvider = new this.$JsSignatureProvider([privateKey]);
               let api = new this.$eosjs.Api({ rpc, signatureProvider });
               let data={
                      actions: [{
                        account: 'eosio',
                        name: '',
                        authorization: [{
                          actor: this.selectedAcct.acctName,
                          permission: 'active',
                        }],
                        data: {
                          payer: this.selectedAcct.acctName,
                          receiver: this.form.receiver,
                        },
                      }]
                    }
              
                  if(this.form.unint==='bytes'){
                      data.actions[0].name='buyrambytes'
                      data.actions[0].data.bytes=this.form.quant
                    }else{
                       data.actions[0].name='buyram'
                       data.actions[0].data.quant= `${this.form.quant} EOS`
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
                              title: '购买成功',
                              message: ` <p>交易ID"${transaction_id}"</p><p>接下来可以前往查看浏览器操作详情</p> `,
                              duration: 4000,
                              type: 'success',
                              dangerouslyUseHTMLString: true
                          })          
           }catch(error){
              console.info(error);
              this.loading.close()
              this.$notify({
                  title: '购买失败',
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
  },created(){
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
