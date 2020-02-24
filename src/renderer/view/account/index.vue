<template>
 <div class="container">
    <el-row>
        <el-col :span="22" :push="1">
          <el-card>
            <el-button type="text" @click="currentTabCompnent = 'myac'">我的账户</el-button>
            <el-button type="text" @click="importAcctVisible=true">导入账户</el-button>
            <!-- <el-button type="text" >创建账户</el-button> -->
            <!-- <el-button type="text" >公钥搜索</el-button> -->
        </el-card>
       <transition name="fade" mode="out-in">
          <component :is="currentTabCompnent" ref="child"></component>
        </transition>
      </el-col>
    </el-row>
    

      <el-dialog title="导入账户" :visible.sync="importAcctVisible" >
        <el-form :model="importAccount" :rules="importAcctRules" ref="importAccount">
            <el-form-item label="私钥" label-width="120px" prop="privKey">
                <el-input v-model="importAccount.privKey" autocomplete="off" ></el-input>
            </el-form-item>
              <el-form-item label="所属公链" label-width="120px" prop="chain">
            <el-select v-model="importAccount.chain" filterable placeholder="请选择所属公链" >
              <el-option v-for="chain in chains" :key="chain._id" :label="chain.chainName" :value="chain"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="importAcctVisible = false">取 消</el-button>
            <el-button type="primary" @click="importAcctByKeySubmit">确 定</el-button>
        </div>
    </el-dialog>
    </div>
</template>

<script>
import {mapState  } from 'vuex'
export default {
   name: 'account',
  components: {
    'myac': () => import('@/view/account/myac'),
   
  },
 data(){
    var checkPrivKey = (rule, value, callback) => {
            if (!value) {
                 callback(new Error('请填入私钥'));
            }
            let  isValidPrivate=this.$ecc.isValidPrivate(this.importAccount.privKey);//私钥
             if (!isValidPrivate) {
                 callback(new Error('请填入合法的私钥'));
            }
            callback();
         }
     return{
        currentTabCompnent: 'myac',
         importAcctVisible:false,
         chains:[],
         importAccount:{
             privKey:'',
             acctName:'',
             ownKey:'',
             acticeKey:'',
             chain:""
                      },
         importAcctRules: {
          privKey: [
            { validator:checkPrivKey, trigger: 'change' }
          ],
         chain: {required: true, message: '请选择所属公链', trigger: 'blur'},
        }
     }
 },methods:{
     loadChainInfo(){
        this.$walletdb.find({doc:'netconfig'}).then(res=>{
            this.chains=res;
        }).catch(error=>{
             console.error(error)
        })
     },
     async importAcctByKey(){
       try{
          console.info(this.importAccount)
          this.openFullScreenLoading();
          let pubkey=this.$ecc.privateToPublic(this.importAccount.privKey,this.importAccount.chain.prefix);//私钥
          let rpc = new this.$eosjs.JsonRpc (this.importAccount.chain.httpEndpoint)
          let res = await rpc.history_get_key_accounts(pubkey)
          let acctNameList=res.account_names;
          if(acctNameList.length===0){
                this.$message.error('私钥对应公钥下无账户，请确认！')
                this.loading.close()
            return 
            }
          let account={
                            acctName:acctNameList[0],
                            ownKey:pubkey,
                            acticeKey:pubkey,
                            privKey:this.importAccount.privKey,
                            chain_id:this.importAccount.chain._id,
                        }
          let dbRes= await this.$walletdb.insert(Object.assign({doc:'acct'}, account))
           console.info('dbRes',this.importAccount)
          this.$message.success('账户导入成功！')
           this.resetForm('importAccount')
           this.importAcctVisible=false;
            this.currentTabCompnent='myac'
           this.$refs.child.loadAccountFromDb()
           this.loading.close()
       }catch(error){
         console.error(error);
          this.loading.close()
          this.$message.error('账户信息保存失败！')
       }
     },
     importAcctByKeySubmit(){
         this.impoting=true;
         this.$refs['importAccount'].validate((valid) => {
                if (valid) {
                     this.importAcctByKey()
                } 
                });
            },
    resetForm(formName) {
        this.$refs[formName].resetFields();
    }

 },created(){
    this.loadChainInfo();
 },computed:{ 
     ...mapState({
        eos: state => state.eos,
    }),

 }
 
}
</script>

<style scoped>
  .fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>