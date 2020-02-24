import {
  SETKEY,
  CONNECTEOSNET,
  SETEOSNETCONFIG,
  SETNODEINFO,
  SETLOGIN,
  SETLOGOUT
} from './type'

export default {
  [SETKEY] (state, key) {
    state.key = key
    state.isOnline = true

  },
  [CONNECTEOSNET] (state, eos) {
    state.eos = eos
    state.isOnline = true
  },
  
  [SETEOSNETCONFIG] (state, config) {
    state.isOnline = false
    state.eos = null
    state.key = null
    state.eosConfig = config
  },
  [SETNODEINFO] (state, info) {
    state.nodeInfo=info
  },
  [SETLOGIN] (state){
    state.islogin=true
  },
  [SETLOGOUT](state){
    state.islogin=false
  }

}
