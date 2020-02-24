<template>
  
  <el-row class="container" :gutter='20'>
    <el-row>
      <h2>我的账户</h2>
        <el-alert title="还未导入任何账户信息请先导入!" type="warning" :closable="false" v-if="showEmptyMsg"></el-alert>
    </el-row>
     <el-row :gutter='20'>
    <el-col :span="6">
        <div v-loading="loadAcct">
         <el-card class="box-card" v-for="item in accts" >
            <div slot="header" class="clearfix">
                <span style=" font-weight: bolder">{{item.acctName}}</span>
                <el-button style="float: right; padding: 3px 0" type="text" @click="remove(item._id)">删除</el-button>
                <el-button style="float: right; padding: 3px 0" type="text"  @click="showDetail(item)">详情</el-button>
            </div>
            <div >
                {{item.chainName}}
                  <el-button style="float: right; padding: 3px 0;margin-left:5px" type="danger" @click="showprivBefore(item._id)">导出私钥</el-button>
            </div>
        </el-card>
        </div>
    </el-col>
     <el-col :span="10"  v-loading="loadingDetail">
        <el-card v-if="showDetailBlock">
             <el-form label-position="left" size="mini">
               <el-form-item>
                  <h3>总资产</h3>
                  <p v-for="asset in acctDetail.assets">
                    {{ asset.balance}} 
                    </p>
                </el-form-item>
                <el-form-item>
                  <h3>总资源</h3>
                  <p>NET 权重：{{ acctDetail.total_resources.net_weight }} / 自身抵押：{{ acctDetail.self_delegated_bandwidth.net_weight }}</p>
                  <p>CPU 权重：{{ acctDetail.total_resources.cpu_weight }} / 自身抵押：{{ acctDetail.self_delegated_bandwidth.cpu_weight }}</p>
                  <p>可用RAM：{{ acctDetail.ram_quota }} KB / 已用：{{ acctDetail.ram_usage }} KB</p>
                  <p v-if="acctDetail.refund_request">
                    退还EOS资源请求：
                    CPU <span>{{ acctDetail.refund_request.cpu_amount }}</span> /
                    NET <span>{{ acctDetail.refund_request.net_amount }}</span>
                    <i class="el-icon-arrow-right" style="color: green;font-weight: 800;"></i>
                    <span>{{ acctDetail.refund_request.owner }}</span>
                    (<span>{{ acctDetail.refund_request.request_time }}</span>)
                  </p>
                </el-form-item>
              </el-form>
              <el-form v-if="acctDetail.delegated_bandwidth">
                <el-form-item>
                  <h3>抵押带宽</h3>
                  <p>
                    from: {{ acctDetail.delegated_bandwidth.from }}
                    <i class="el-icon-caret-right"></i>
                    to: {{ acctDetail.delegated_bandwidth.to }}
                    | 网络权重: {{acctDetail.delegated_bandwidth.net_weight}} | CPU 权重: {{acctDetail.delegated_bandwidth.cpu_weight}}
                  </p>
                </el-form-item>
              </el-form>
              <el-form label-position="left" size="mini" inline class="table-expand">
                <el-form-item>
                  <h3>网络使用情况</h3>
                </el-form-item>
                <el-form-item></el-form-item> <!-- placeholder -->
                <el-form-item label="已用NET">
                  <span>{{ acctDetail.net_limit.used }}</span>
                </el-form-item>
                <el-form-item label="已用CPU">
                  <span>{{ acctDetail.cpu_limit.used }}</span>
                </el-form-item>
                <el-form-item label="可得">
                  <span>{{ acctDetail.net_limit.available }}</span>
                </el-form-item>
                <el-form-item label="可得">
                  <span>{{ acctDetail.cpu_limit.available }}</span>
                </el-form-item>
                <el-form-item label="最大可用">
                  <span>{{ acctDetail.net_limit.max }}</span>
                </el-form-item>
                <el-form-item label="最大可用">
                  <span>{{ acctDetail.cpu_limit.max }}</span>
                </el-form-item>
              </el-form>
              <template v-for="(item, pIndex) in acctDetail.permissions">
                <el-form label-position="left" size="mini" :key="pIndex">
                  <el-form-item>
                    <h3>账户{{ item.perm_name }}权限</h3>
                    <p>阀值：{{ item.required_auth.threshold }}</p>
                    <p v-for="(key, kIndex) in item.required_auth.keys" :key="kIndex">
                    weight: {{ key.weight }} / key: {{ key.key }}
                    </p>
                    <p>parent: <strong style="color: #4285f4;">{{ item.parent }}</strong> </p>
                    <p>
                      此公钥相关账户：
                      <el-tag
                        v-for="(account, aIndex) in item.accounts"
                        :key="aIndex"
                        size="mini"
                        color="#F2FAFE"
                        :hit="false">{{ account }}</el-tag>
                    </p>
                  </el-form-item>
                </el-form>
              </template>
              <el-form v-if="acctDetail.voter_info">
                <el-form-item>
                  <h3>账户投票信息</h3>
                  <p>抵押：{{ acctDetail.voter_info.staked / 10000 }} EOS</p>
                  <p>
                    已投的生产者：
                    <el-tag
                      type="success"
                      size="mini"
                      v-for="name in acctDetail.voter_info.producers"
                      :key="name">{{ name }}</el-tag>
                  </p>
                  <hr>
                  <p>最后一次投票权重：{{ acctDetail.voter_info.last_vote_weight }}</p>
                  <p>取消抵押：{{ acctDetail.voter_info.unstaking }}</p>
                  <p>最后一次取消抵押时间：{{ acctDetail.voter_info.last_unstake_time }}</p>
                  <p>deferred_trx_id： {{ acctDetail.voter_info.is_proxy }}</p>
                  <p v-if="acctDetail.voter_info.is_proxy === 1">
                    是否已代理：{{ acctDetail.voter_info.is_proxy === 0 ? '否' : '是' }}
                  </p>
                  <template v-if="acctDetail.voter_info.is_proxy === 1">
                    <p>代理账户：{{ acctDetail.voter_info.proxy }}</p>
                    <p>代理投票权重：</p>
                  </template>
                </el-form-item>
              </el-form>
        </el-card/>
      </el-col>
      </el-row>
        <el-dialog title="密码验证" :visible.sync="passCheckFormVisible" width="50%" >
        <el-form :model="passCheckForm" :rules="passCheckRules" ref="passCheckForm">
          <el-form-item label="钱包密码" label-width="120px" prop="pass">
            <el-input v-model="passCheckForm.pass" autocomplete="off" type="password"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="checkPass()">确 定</el-button>
        </div>
      </el-dialog>
  </el-row>

</template>

<script>
import {mapState  } from 'vuex'
export default {
 data(){
     return{
         accts:[],
         showEmptyMsg:false,
         loadAcct:true,
         showDetailBlock:false,
         loadingDetail:false,
        acctDetail:{},
        passCheckFormVisible:false,
        passCheckForm:{
          id:'',
          pass:''
        },
       passCheckRules: {
        pass: {required: true, message: '请输入密码', trigger: 'blur'}
      },
     }
 },methods:{
     async loadAccountFromDb(){
         this.loadAcct=true;
         this.accts=[];
       try{
         let docs= await this.$walletdb.find({doc:'acct'})
            if(!docs||docs.length===0){
                 this.showEmptyMsg=true
                   this.loadAcct=false;
                }else{
                  this.showEmptyMsg=false
                  for(let item of docs){
                     let chainInfo=await this.$walletdb.findOne({doc:'netconfig',_id:item.chain_id})
                            if(chainInfo){
                              item.chainName=chainInfo.chainName;
                            }
                  }
                  this.accts=docs;
                  this.loadAcct=false;
                }
                  
            }catch(error) {
                  console.error(error);
                  this.$message.error('账户查询失败！')
                   this.loadAcct=false;   
                }
      
     },
     async showDetail({acctName,chain_id}){
        try{
            this.loadingDetail=true;
            let chainInfo=await this.$walletdb.findOne({doc:'netconfig',_id:chain_id})
            let rpc = new this.$eosjs.JsonRpc (chainInfo.httpEndpoint)
            let res = await rpc.get_account(acctName)
            this.acctDetail=res;
            let ram_quota=this.changeToKB( this.acctDetail.ram_quota);
            let ram_usage=this.changeToKB( this.acctDetail.ram_usage);
            this.acctDetail.ram_quota=ram_quota;
            this.acctDetail.ram_usage=ram_usage;
            let assets=await rpc.get_table_rows({"json":true,"code":"eosio.token","scope":acctName,"table":"accounts"})
            this.acctDetail.assets=assets.rows;
            this.showDetailBlock=true;
            this.loadingDetail=false;
        }catch(error){
             console.error(error);
              this.$message.error('账户查询失败！')
        }
 
     },

    showprivBefore(id){
        this.passCheckFormVisible=true;
        this.passCheckForm.id=id;
      
    }, checkPass(){
      this.$refs['passCheckForm'].validate((valid) => {
        if (valid) {
          this.showprivAfter();
        } 
      })
    },async showprivAfter(){
       let currentPass=await this.$walletdb.findOne({doc:'sec',type:'wallet_pass'},true)
        if(!currentPass){
           this.$message.warning('钱包密码未设置，请先设置！')
        }else{
           let encPass=this.SHA256(this.passCheckForm.pass)
           if(encPass!=currentPass.value){
              this.$message.warning('密码错误！')
            }else{
                this.passCheckFormVisible=false;
                this.$refs['passCheckForm'].resetFields()
                let doc = await this.$walletdb.findOne({doc:'acct',_id:this.passCheckForm.id})
                this.$alert(doc.privKey, '', {
                    confirmButtonText: '确定',
                    });
            }
        }
    },remove(id){
         this.$confirm('此操作将永久从钱包中删除该账户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
            this.$walletdb.remove({doc:'acct',_id:id}).then(res => {
                    this.$message.success('删除成功！')
                     this.loadAccountFromDb();
                }).catch(error => {
                    this.$message.error('删除失败！')
            });  
        })
      },
       changeToKB(limit){
             let size = (limit/1024).toFixed(2) 
            return size;
        }

 },created(){
     this.loadAccountFromDb();
 },computed:{ 
     ...mapState({
        eosConfig: state => state.eosConfig,
        eos: state => state.eos,
    }),

 }
 
}
</script>

<style scoped>
.box-card{
  margin-bottom: 20px
}
.table-expand {
  font-size: 0;
}
.table-expand label {
  width: 90px;
  color: #99a9bf;
}
.table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 50%;
}

.el-form-item p{
  margin: 0;
}
.el-tag + .el-tag {
  margin-left: 10px;
}
</style>