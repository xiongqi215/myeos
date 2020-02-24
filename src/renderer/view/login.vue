<template>
  <el-row style="margin-top:200px">
    <el-col :xs="12" :sm="12" :lg="12" :push="6">
      <el-card>
        
        <el-form :model="passForm" :rules="rules" ref="passForm" label-width="100px">
          <el-form-item >
            <h1> 验证您的钱包密码 </h1>
            </el-form-item>
          <el-form-item prop="pass">
             <el-input v-model="passForm.pass" placeholder="输入您的钱包密码" type="password" >
                 <template slot="prepend"><i class="el-icon-lock"></i></template>
             </el-input>
          </el-form-item>
           <el-form-item>
            <el-button type="danger" @click="handleSubmit">确  定</el-button>
            <el-button type="ghost" @click="resetForm">重  置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
import {mapActions} from 'vuex'

export default {
 data () {
    return {
        passForm:{
            pass:''
        },
      rules: {
        pass: {required: true, message: '请输入密码', trigger: 'blur'},
      },
    }
},
methods:{
  ...mapActions([
      'setlogin',
    ]),
 
  handleSubmit () {
      this.$refs['passForm'].validate((valid) => {
        if (valid) {
          this.openFullScreenLoading()
         
          this.doLogin()
         
        } else {
          this.$message.warning('填写有误')
          return false
        }
      })
    },
    async doLogin(){
        let encPass=this.SHA256(this.passForm.pass)
         try{
            let currentPass=await this.$walletdb.findOne({doc:'sec',type:'wallet_pass'},true)
            if(encPass!=currentPass.value){
                  this.$message.warning('密码错误！')
                  this.resetForm()
                  this.loading.close()
                  return ;
            }else{
               setTimeout(() =>{
                this.loading.close()
                this.setlogin()
                this.$router.push( {path: '/'})
                 },2000);

            }
         }catch(error){
              this.$message.warning('系统异常！')
               console.error(error)
              return null;
        }
    },
    resetForm () {
      this.$refs['passForm'].resetFields()
    },
},created(){
  this.$walletdb.findOne({doc:'sec',type:'wallet_pass'},true).then(res=>{
        if(!res){
         this.$router.push( {path: '/init'})
       }
  }).catch(e=>{
       console.error(e)
  })
}
}
</script>

<style>

</style>