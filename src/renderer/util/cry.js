import CryptoJS from 'crypto-js/crypto-js'

export function SHA256(str){
    return CryptoJS.SHA256(str).toString();
}




export function  des_encrypt(str,key,iv)
{
	 key			= CryptoJS.MD5(key).toString();
	 iv			= CryptoJS.MD5(iv).toString();
	let crypto_key 	= CryptoJS.enc.Utf8.parse(key);
	let crypto_iv 	= CryptoJS.enc.Utf8.parse(iv.substr(0,8));
	
	//console.log(crypto_key.toString(CryptoJS.enc.Utf8));
	//console.log(crypto_iv.toString(CryptoJS.enc.Utf8));
	let encode_str 	= CryptoJS.TripleDES.encrypt(str, crypto_key, {    
						iv: 		crypto_iv,    
						mode: 		CryptoJS.mode.CBC,    
						padding: 	CryptoJS.pad.Pkcs7});
	return encode_str.toString();
}
export function  des_decrypt(str,key,iv)
{
	 key			= CryptoJS.MD5(key).toString();
	 iv			= CryptoJS.MD5(iv).toString();
	let crypto_key 	= CryptoJS.enc.Utf8.parse(key);
	let crypto_iv 	= CryptoJS.enc.Utf8.parse(iv.substr(0,8));
	let decrypt_str	= CryptoJS.TripleDES.decrypt(str, crypto_key, {    
						iv: 		crypto_iv,    
						mode: 		CryptoJS.mode.CBC,    
						padding: 	CryptoJS.pad.Pkcs7});
	return 	decrypt_str.toString(CryptoJS.enc.Utf8);	
}
