import {
  SETKEY,
  CONNECTEOSNET,
  SETEOSNETCONFIG,
  SETNODEINFO,
  SETLOGIN,
  SETLOGOUT
} from './type'

const EOS =  require('eosjs')
export default {
  setlogin({commit}){
    commit(SETLOGIN)

  },
  setlogout({commit}){
    commit(SETLOGOUT)
  },
  setKey ({commit}, key) {
    commit(SETKEY, key)
  },
  connectEOSNet ({commit, state}) {
    return new Promise(function (resolve, reject) {
      if (state.key) {
        let config = Object.assign(
          {
            keyProvider: state.key.prikeys // WIF string or array of keys..
          },
          state.eosConfig
        )
        let eos = EOS(config)
        commit(CONNECTEOSNET, eos)
        resolve(eos)
      } else {
        let eos = EOS(state.eosConfig)
        commit(CONNECTEOSNET, eos)
        resolve(eos)
      }
    })
  },
 
  setEOSNetConfig ({commit}, config) {
    commit(SETEOSNETCONFIG, config)
  },


  setNodeInfo ({commit,state} ) {
    if(!state.isOnline){
         commit(SETNODEINFO, {
          server_version: 'N/A',
          chain_id: 'N/A',
          head_block_num: 'N/A',
          last_irreversible_block_num: 'N/A',
          last_irreversible_block_id: 'N/A',
          head_block_id: 'N/A',
          head_block_time: 'N/A',
          head_block_producer: 'N/A',
          virtual_block_cpu_limit: 'N/A',
          virtual_block_net_limit: 'N/A',
          block_cpu_limit: 'N/A',
          block_net_limit: 'N/A',
          server_version_string: 'N/A'
        },)
         
    }
    let eos=state.eos;
    eos.getInfo({})
    .then(res => {
      
      commit(SETNODEINFO, res)
    })
    .catch(e => {
     
    })

  }
 
}
