<template>
     <div class="container">
         <el-card>
              <h3>钱包密码设置</h3>
                <el-form  :model="passForm" ref="passForm" :rules="passFormRules">
                    <el-form-item label="当前密码" prop="oldPass">
                    <el-input v-model="passForm.oldPass" placeholder="请输入当前密码，若为第一次设置，保持空" type="password" ></el-input>
                    </el-form-item>
                    <el-form-item label="新密码" prop="newPass1">
                        <el-input v-model="passForm.newPass1" placeholder="请输入新密码" type="password" @input="checkStrong" ></el-input>
                        <el-progress :percentage="passStrong.mode" :format="passStrongFormat" v-if="passForm.newPass1.length>0" :color="passStrong.color"></el-progress>
                    </el-form-item>
                    <el-form-item label="确认密码" prop="newPass2">
                    <el-input v-model="passForm.newPass2" placeholder="请再次输入新密码" type="password" ></el-input>
                    </el-form-item>
                    <el-form-item>
                    <el-button type="primary" @click="changePass()">确认修改</el-button>
                    </el-form-item>
                </el-form>
        </el-card>
     </div>
</template>
<script>

export default {
  name: 'walletPass',
  data () {
    var validatePass2 = (rule, value, callback) => {
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
        oldPass:'',
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
  methods: {
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
    async execUpdatePass(){
      let newPass=this.SHA256(this.passForm.newPass1)
     let encPass=this.SHA256(this.passForm.oldPass)
      try{
        let currentPass=await this.$walletdb.findOne({doc:'sec',type:'wallet_pass'},true)        
          if(encPass!=currentPass.value){
              this.$message.warning('当前密码错误！')
              return ;
            }
            let saveConfirm=true;
            if(this.passStrong.mode<100){
                try{
                  await this.$confirm('您所设置的密码强度不够，较强的密码至少8位，且包含数字，大小写字母和一个特殊符号, 是否继续按此设置?', '提示', {confirmButtonText: '确定',cancelButtonText: '取消', type: 'warning'})
                }catch(error){
                      saveConfirm=false;
                   }
            }
            if(saveConfirm){
             let res=await this.$walletdb.update({ doc:'sec',type:'wallet_pass',_id:currentPass._id}, { $set: { value: newPass} }, { multi: false }) 
              this.$message.success('设置成功!')
               this.resetForm('passForm')
            }
         }catch(error){
              this.$message.warning('系统异常！')
               console.error(error)
              return null;
        }
       
    },
    
     changePass () {
      this.$refs['passForm'].validate((valid) => {
        if (valid) {
           this.execUpdatePass()
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
