<template>
  <el-row style="margin-top:200px">
    <el-col :xs="12" :sm="12" :lg="12" :push="6">
      <el-card>
         <h3>钱包密码设置</h3>
      <el-form  :model="passForm" ref="passForm" :rules="passFormRules">
        </el-form-item>
        <el-form-item label="新密码" prop="newPass1">
        <el-input v-model="passForm.newPass1" placeholder="请输入新密码" type="password"  :show-password="true" @input="checkStrong"></el-input>
        <el-progress :percentage="passStrong.mode" :format="passStrongFormat" v-if="passForm.newPass1.length>0" :color="passStrong.color"></el-progress>
        </el-form-item>
        <el-form-item label="确认密码" prop="newPass2">
        <el-input v-model="passForm.newPass2" placeholder="请再次输入新密码" type="password" ></el-input>
        </el-form-item>
        <el-form-item>
        <el-button type="primary" @click="handleSubmit">确  认</el-button>
        <el-button type="ghost" @click="resetForm">重  置</el-button>
        </el-form-item>
    </el-form>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
export default {
 data () {
       let validatePass2 = (rule, value, callback) => {
	                if (value === '') {
	                callback(new Error('请再次输入密码'));
	                } else if (value !== this.passForm.newPass1) {
	                callback(new Error('两次输入密码不一致!'));
	                } else {
	                callback();
	                }
	            };
    return {
       passForm:{
        newPass1:'',
        newPass2:''
      },
       passFormRules: {
        newPass1: {required: true, message: '请输入新密码', trigger: 'blur'},
        newPass2: {required: true, validator: validatePass2, trigger: 'blur' }
                   
      },
       passStrong:{
           mode:25,
           color:'#F56C6C',
       }
    }
},
methods:{
    checkStrong(){
        let pass=this.passForm.newPass1;
         this.passStrong.mode=0
        if(pass.length>0){
             let strong=this.$checkPassStrong(pass);
             switch (strong) {
                case 1:
                    this.passStrong.mode=25
                    this.passStrong.color='#F56C6C'
                break;
                case 2:
                    this.passStrong.mode=50
                    this.passStrong.color='#E6A23C'
                break;
                case 3:
                this.passStrong.mode=75
                this.passStrong.color='#409EFF'
                break;
                case 4:
                    this.passStrong.mode=100
                    this.passStrong.color='#67C23A'
                break;
            }
        }
    },
    passStrongFormat(percentage){
            switch (percentage) {
            case 25:
                return "弱";
               break;
            case 50:
                return "一般";
                 break;
            case 75:
                return "中等";
                 break;
            case 100:
                return "强";
                 break;
            }
    },
  handleSubmit () {
      this.$refs['passForm'].validate((valid) => {
        if (valid) {
            if(this.passStrong.mode<100){
                  this.$confirm('您所设置的密码强度不够，较强的密码至少8位，且包含数字，大小写字母和一个特殊符号, 是否继续按此设置?', '提示', {confirmButtonText: '确定',cancelButtonText: '取消', type: 'warning'}).then(() => {
                            this.openFullScreenLoading()
                            this.doInit()
                        })  
            }else{
                this.openFullScreenLoading()
                this.doInit()
            }
           
        } 
      })
    },
    async doInit(){
      let newPass=this.SHA256(this.passForm.newPass1)
      try{
            await this.$walletdb.insert({doc:'sec',type:'wallet_pass',value:newPass})
            this.$message.success('设置成功!')
            this.resetForm('passForm')
             setTimeout(() =>{
                this.loading.close()
                this.$router.push( {path: '/'})
             },2000);

         }catch(error){
              this.$message.warning('系统异常！')
               console.error(error)
               this.loading.close()
        }
    },
    resetForm () {
      this.$refs['passForm'].resetFields()
    },
}
}
</script>

<style>

</style>