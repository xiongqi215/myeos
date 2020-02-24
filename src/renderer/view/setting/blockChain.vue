<template>
     <div class="container">
         <el-card>
            <h3>添加</h3>
            <el-form :rules="rules" :model="form" ref="form" label-width="80px">
                 <el-form-item label="区块链名称" prop="chainName" >
                    <el-input v-model="form.chainName" placeholder="自定义链名称，便于记忆"></el-input>
                </el-form-item>
                <el-form-item label="节点地址"  prop="httpEndpoint">
                <el-row type="flex">
                    <el-col :span="18">
                    <el-input v-model="form.httpEndpoint" placeholder="请输入节点地址,格式一般为http 或者 https://ip:端口"></el-input>
                    </el-col>
                    <el-col :span="4" :push="2">
                    <el-button type="warning" @click="checkLinkAndSetChainId">测试网络</el-button>
                    </el-col>
                </el-row>
                </el-form-item>
                 <el-form-item label="链前缀"  prop="prefix">
                    <el-input v-model="form.prefix" placeholder="特殊公钥前缀，默认为EOS"></el-input>
                </el-form-item>
                 <el-form-item label="链ID" prop="chanId">
                    <el-input v-model="form.chanId" placeholder=""></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleSubmit('form')">添加区块链信息</el-button>
                    <el-button type="ghost" @click="resetForm('form')">重置</el-button>
                </el-form-item>
            </el-form>
          </el-card>
            <h3>区块链列表</h3>
           <el-table :data="tableData" height="250" border style="width: 100%" fit v-loading="loadingChainData">
                <el-table-column type="index" width="50"></el-table-column>
                <el-table-column prop="chainName" label="区块链名称"  > </el-table-column>
                <el-table-column prop="prefix" label="链前缀"> </el-table-column>
                <el-table-column prop="chanId" label="链ID"width="550" > </el-table-column>
                <el-table-column prop="httpEndpoint" label="节点地址" > </el-table-column>
                 <el-table-column
                    fixed="right"
                    label="操作"
                    width="100">
                    <template slot-scope="scope">
                        <el-button type="text" size="small" @click="remove(scope.row._id)">删除</el-button>
                    </template>
                    </el-table-column>
            </el-table>
     </div>
</template>
<script>

export default {
  name: 'setting-block-chain',
  data () {
    return {
      form: {
        chainName:'',
        httpEndpoint: '',
        prefix:'EOS',
        chanId:''
      },
      rules: {
        httpEndpoint: {required: true, message: '请输入节点地址', trigger: 'blur'},
        chainName: {required: true, message: '请输入节点名称', trigger: 'blur'},
      },
      tableData:[],
      loadingChainData: false,
      setChainId:false,
    }
  },
  methods: {
    loadChainData(){
      this.loadingChainData=true;
      this.$walletdb.find({doc:'netconfig'}).then(docs => {
        if(docs){
           this.tableData=docs;
           this.loadingChainData=false;
        }
        }).catch(error => {
            console.error(error)
            this.$message.error('获取失败！')
            this.loadingChainData=false;
        });  
    },
    async checkLinkAndSetChainId () {
      if (this.form.httpEndpoint === '') {
        this.$message.warning('请输入端点')
        return
      }
      this.openFullScreenLoading()
      try{
        let httpEndpoint= this.form.httpEndpoint
        let rpc = new this.$eosjs.JsonRpc (httpEndpoint)
        let nodeInfo=await rpc.get_info()
          console.info(nodeInfo)
          this.form.chanId=nodeInfo.chain_id
          this.setChainId = true
          this.loading.close()
          this.$message.success('连接可用')
        }catch(e ) {
          console.error(e)
          this.loading.close()
          this.setChainId = false
          this.$message.error('测试失败')
        }
    },
    handleSubmit (formName) {
      this.$refs[formName].validate((valid) => {
        if (!this.setChainId) {
          this.$message.warning('请先测试网络连接')
          return false
        }
        if (valid) {
            this.insertChainInfo()
        } 
      })
    },
    async insertChainInfo(){
       try{
            this.openFullScreenLoading()
            let doc= await this.$walletdb.findOne({doc:'netconfig','chanId':this.form.chain_id})
            debugger;
            if(doc){
                    this.$message.error('链信息已存在！')
                    this.loading.close()
                    return;
            }
            await this.$walletdb.insert(Object.assign({doc:'netconfig'}, this.form))
            this.loading.close()
            this.$message.success('配置保存成功!')
            this.resetForm('form')
            this.loadChainData();
       }catch(error){
            console.error(error)
            this.$message.success('配置保存失败!')
       }
    },
    remove(id){
         this.$confirm('确认删除节点信息?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
            this.$walletdb.remove({doc:'netconfig',_id:id}).then(res => {
                    this.$message.success('删除成功！')
                    this.loadChainData();
                }).catch(error => {
                    this.$message.error('删除失败！')
            });  
        })
      },
  resetForm (formName) {
      this.$refs[formName].resetFields()
    },
  },created(){
       this.loadChainData();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.el-card + .el-card {
  margin-top: 20px;
}
@media (max-width: 1199px) {
  .aside-spaceing {
    margin-top: 20px;
  }
}
@media (min-width: 1200px) {
  .aside-spaceing {
    margin-left: 20px;
  }
}
</style>
