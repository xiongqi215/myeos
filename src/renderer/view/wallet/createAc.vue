<template>
  <el-row class="container">
    <el-col :xs="24" :sm="22" :lg="14">
      <el-card>
        <h3>创建账户</h3>
        <el-form :model="form" :rules="formRules" ref="form">
          <el-form-item label="新账户名" prop="accountName">
              <el-input v-model="form.accountName" maxlength="12" placeholder="请输入账户名"></el-input>
           </el-form-item>
           <el-form-item label="创建账户" prop="creator">
            <el-select v-model="form.creator" filterable placeholder="请选择创建账户"  @change="changePayer">
              <el-option v-for="item in accounts" :key="item._id" :label="item.acctName" :value="item._id"></el-option>
            </el-select>
          </el-form-item>
            <el-form-item label="新账户owner公钥" prop="owner">
              <el-input v-model="form.owner" placeholder="请输入新账户owner公钥"></el-input>
            </el-form-item>
            <el-form-item label="新账户active公钥" prop="active">
              <el-input v-model="form.active" placeholder="请输入新账户active公钥"></el-input>
            </el-form-item>
            <el-form-item label="购买内存数" prop="bytes">
              <el-input v-model="form.bytes" placeholder="为新账户购买的内存数，单位bytes"></el-input>
            </el-form-item>
            <el-form-item label="抵押网络数" prop="stake_net_quantity">
              <el-input v-model="form.stake_net_quantity" placeholder="为新账户抵押网络数"></el-input>
            </el-form-item>
            <el-form-item label="抵押CPU数" prop="stake_cpu_quantity">
              <el-input v-model="form.stake_cpu_quantity" placeholder="为新账户抵押网络数"></el-input>
            </el-form-item>
            <el-form-item label="赠送抵押">
              <el-radio v-model="form.transfer" :label="true">是</el-radio>
              <el-radio v-model="form.transfer" :label="false">否</el-radio>
              <p> 如果是，抵押的金额将会赠送给接受者，否则抵押金额所有权将保留</p>
            </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSubmit('form')">确  定</el-button>
             <el-button type="ghost" @click="resetForm('form')">重置表单</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </el-col>
  </el-row>

</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'createAc',
  data () {
     let ecc =this.$ecc
   let validateAccountName = function (rule, val, cb) {
      let re = /^[1-5a-z]+$/g
      if (val === '') {
        cb(new Error('请输入新建账户名'))
      } else if (!re.test(val)) {
        cb(new Error('名字只能包含 1-5 a-z!'))
      } else {
        cb()
      }
    }
    let validateEOSKey = function (rule, val, cb) {
      console.info(ecc)
      if (val === '') {
        cb(new Error('请输入合法的 Key!'))
      } else if (!ecc.isValidPublic(val)) {
        cb(new Error('Key 格式错误，请检查!'))
      } else {
        cb()
      }
    }
    let validateBytes = function (rule, val, cb) {
      if (val === '') {
        cb(new Error('请输入 Bytes!'))
      } else if (Number.isNaN(Number(val))) {
        cb(new Error('Bytes 必须为纯数字'))
      } else {
        cb()
      }
    }
    return {
      accounts:[],
      loadAcct:false,
      selectedAcct:{
        httpEndpoint:'',
        acctName:'',
      },
       form: {
        creator: '',
        accountName: '',
        owner: '',
        active: '',
        bytes: 8192,
        stake_net_quantity: '',
        stake_cpu_quantity: '',
        transfer: false
      },
       formRules: {
        creator: {required: true, message: '请选择账户', trigger: 'change'},
        accountName: {required: true, validator: validateAccountName, trigger: 'blur'},
        owner: {required: true, validator: validateEOSKey, trigger: 'blur'},
        active: {required: true, validator: validateEOSKey, trigger: 'blur'},
        bytes: {required: true, validator: validateBytes, trigger: 'blur'},
        stake_net_quantity: {required: true, trigger: 'blur'},
        stake_cpu_quantity: {required: true, trigger: 'blur'}
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
         if(this.form.self){
          this.form.receiver=this.selectedAcct.acctName
      }
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
                  console.info(this.accounts)
                }
     },

    handleSubmit (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.openFullScreenLoading()
          this.createAc()
        } else {
          this.$message.warning('填写有误')
          console.log('error submit!!')
          return false
        }
      })
    },
     async createAc () {
          let privateKey=this.selectedAcct.privateKey;
         this.openFullScreenLoading()
           try{
               let rpc = new this.$eosjs.JsonRpc (this.selectedAcct.httpEndpoint)
               let signatureProvider = new this.$JsSignatureProvider([privateKey]);
               let api = new this.$eosjs.Api({ rpc, signatureProvider });
               let data={
                      actions: [{
                        account: 'eosio',
                        name: "newaccount",
                        authorization: [{
                          actor: this.selectedAcct.acctName,
                          permission: 'active',
                        }],
                        data: {
                          creator: this.selectedAcct.acctName,
                          name: this.form.accountName,
                          owner: {
                            threshold: 1,
                            keys: [{
                              key: this.form.owner,
                              weight: 1
                            }],
                            accounts: [],
                            waits: []
                          },
                          active: {
                            threshold: 1,
                            keys: [{
                              key: this.form.active,
                              weight: 1
                            }],
                            accounts: [],
                            waits: []
                          },
                        },
                      },
                      {
                        account: 'eosio',
                        name: 'buyrambytes',
                        authorization: [{
                          actor: this.selectedAcct.acctName,
                          permission: 'active',
                        }],
                        data: {
                          payer: this.selectedAcct.acctName,
                          receiver: this.form.accountName,
                          bytes: this.form.bytes,
                        },
                      },
                      {
                        account: 'eosio',
                        name: 'delegatebw',
                        authorization: [{
                          actor: this.selectedAcct.acctName,
                          permission: 'active',
                        }],
                        data: {
                          from: this.selectedAcct.acctName,
                          receiver: this.form.accountName,
                          stake_net_quantity:  `${this.form.stake_net_quantity} EOS`,
                          stake_cpu_quantity:  `${this.form.stake_cpu_quantity} EOS`,
                          transfer: this.form.transfer,
                        }
                      }]
                  }
                   console.info(data)
                   let res = await api.transact(data,{
                      broadcast:true,
                      blocksBehind: 3,
                      expireSeconds: 120,
                    });
                  console.info(res)
                  let { transaction_id } = res
                  this.loading.close()
                  this.$notify({
                      title: '创建成功',
                      message: ` <p>交易ID"${transaction_id}"</p><p>接下来可以前往查看浏览器操作详情</p> `,
                      duration: 4000,
                      type: 'success',
                      dangerouslyUseHTMLString: true
                  }) 
             }catch(error){
              console.info(error);
              this.loading.close()
              this.$notify({
                  title: '创建失败',
                  message: `<p>可能的原因</p><ol>  <li>1. 输入格式错误</li><li>2. 账户余额不足</li><li>3. 账户名字已存在</li></ol>`,
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
