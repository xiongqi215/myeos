export function checkPassStrong(sValue) {
    let modes = 0;
    
    //正则表达式验证符合要求的
    if (sValue.length < 8) return 1;
    if (/\d/.test(sValue)) modes++; //数字
    if (/[a-z]/.test(sValue)) modes++; //小写
    if (/[A-Z]/.test(sValue)) modes++; //大写  
    if (/\W/.test(sValue)) modes++; //特殊字符
    return modes
}