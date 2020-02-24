import Vue from 'vue'
import path from 'path'
import { remote } from 'electron'
import { checkPassStrong } from '@/util/passwordChecker'

const eosjs= require('eosjs');
const ecc=  require('eosjs-ecc');
const {JsSignatureProvider} = require('eosjs/dist/eosjs-jssig')

const os = require('os');
import {SHA256,des_encrypt,des_decrypt} from '@/util/cry'




export default {
    install(Vue, options) {
          Vue.prototype.$checkPassStrong=checkPassStrong;
          Vue.prototype.$walletdb=remote.getGlobal("walletdb");
          Vue.prototype.SHA256=SHA256
          Vue.prototype.des_encrypt=des_encrypt
          Vue.prototype.des_decrypt=des_decrypt
          Vue.prototype.$eosjs=eosjs
          Vue.prototype.$ecc=ecc
          Vue.prototype.$JsSignatureProvider=JsSignatureProvider
          Vue.prototype.openFullScreenLoading=function() {
            this.loading = this.$loading({
              lock: true,
              text: 'Loading',
              spinner: 'el-icon-loading',
              background: 'rgba(0, 0, 0, 0.7)'
            })
          }

          Vue.prototype.getMac=function(ip) {
             debugger;
            let networkInterfaces = os.networkInterfaces();
            let selectedInterfaceData;
            Object.keys(networkInterfaces).forEach((NetworkID, index, obj) => {
                networkInterfaces[NetworkID].forEach((data) => {
                    if (data.family == "IPv4" && ip== data.address) {
                        //I created new Object because the NetworkID is not provided in the 'data' object
                        selectedInterfaceData = {
                            network: NetworkID,
                            address: data.address,
                            netmask: data.netmask,
                            family: data.family,
                            mac: data.mac,
                        };
                    }
                });
            });
            return selectedInterfaceData.mac;
        }

        Vue.prototype.getIPAdress=function (){
          var interfaces = require('os').networkInterfaces();
          for(var devName in interfaces){
              var iface = interfaces[devName];
              for(var i=0;i<iface.length;i++){
                  var alias = iface[i];
                  if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){
                      return alias.address;
                  }
              }
          }
        }


         
    }
  }