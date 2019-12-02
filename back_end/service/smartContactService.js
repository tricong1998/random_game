const { Api, JsonRpc, RpcError, Serialize } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');  // development only
const fetch = require('node-fetch');                                // node only
const { TextDecoder, TextEncoder } = require('util');               // node only
const BigNumber = require('bignumber.js');
const Const = require('./Const');
const eosService = require('./eosService');
const rpc = new JsonRpc(process.env.ENDPOINT, { fetch });
const fs = require('fs')

async function deploy() {
  const pv = process.env.PV;
  const signatureProvider = new JsSignatureProvider([pv]);
  const api = new Api({ 
    rpc, 
    signatureProvider, 
    textDecoder: new TextDecoder(), 
    textEncoder: new TextEncoder() 
  });
  const wasmFilePath = process.env.SMART_CONTRACT_WASM_FILE;
  const abiFilePath = process.env.SMART_CONTRACT_ABI_FILE;

  let wasmHexString = (await fs.readFileSync(wasmFilePath, 'utf-8'));
  wasmHexString = wasmHexString.replace(/(\r\n\t|\n|\r\t| )/gm, "");
  const buffer = new Serialize.SerialBuffer({
    textEncoder: api.textEncoder,
    textDecoder: api.textDecoder,
  });

  let abiJSON = JSON.parse(await fs.readFileSync(abiFilePath, 'utf-8'))
  const abiDefinitions = api.abiTypes.get('abi_def');
  abiJSON = abiDefinitions.fields.reduce(
    (acc, { name: fieldName }) =>
      Object.assign(acc, { [fieldName]: acc[fieldName] || [] }),
      abiJSON
    )
  abiDefinitions.serialize(buffer, abiJSON);
  serializedAbiHexString = Buffer.from(buffer.asUint8Array()).toString('hex');

  const actions = [    {
    account: Const.eosAccount,
    name: Const.setCode,
    authorization: [
      {
        actor: process.env.ACCOUNT_RANDOM,
        permission: Const.acticePermission,
      },
    ],
    data: {
      account: process.env.ACCOUNT_RANDOM,
      code: wasmHexString,
    },
  },
  {
    account: Const.eosAccount,
    name: Const.setAbi,
    authorization: [
      {
        actor: process.env.ACCOUNT_RANDOM,
        permission: Const.acticePermission,
      },
    ],
    data: {
      account: process.env.ACCOUNT_RANDOM,
      abi: serializedAbiHexString,
    },
  },];
  try {
    return await eosService.sendTx(actions, pv);
  } catch (e) {
    throw new Error(e);
  }
}

async function createNewAccount(nameNewAccount) {
  const publicKeyActive = process.env.PUBLIC_KEY_ACTICE;
  const publicKeyOwner = process.env.PUBLIC_KEY_OWNER;
  const actor = process.env.ACTOR_CREATE_ACCOUNT;
  await _createNewAccount(actor, nameNewAccount, publicKeyOwner, publicKeyActive);
}

async function _createNewAccount(actor, nameNewAccount, publicKeyOwner, publicKeyActive) {
  const actions = [{
    account: Const.eosAccount,
    name: Const.newAccountAction,
    authorization: [{
      actor: actor,
      permission: Const.acticePermission,
    }],
    data: {
      creator: actor,
      name: nameNewAccount,
      owner: {
        threshold: 1,
        keys: [{
          key: publicKeyOwner,
          weight: 1
        }],
        accounts: [],
        waits: []
      },
      active: {
        threshold: 1,
        keys: [{
          key: publicKeyActive,
          weight: 1
        }],
        accounts: [],
        waits: []
      },
    },
  },
  {
    account: Const.eosAccount,
    name: Const.buyRamAction,
    authorization: [{
      actor: actor,
      permission: Const.acticePermission,
    }],
    data: {
      payer: actor,
      receiver: nameNewAccount,
      bytes: 8192,
    },
  },
  {
    account: Const.eosAccount,
    name: Const.delegateAction,
    authorization: [{
      actor: actor,
      permission: Const.acticePermission,
    }],
    data: {
      from: actor,
      receiver: nameNewAccount,
      stake_net_quantity: '1.0000 ' + process.env.TOKEN_NAME,
      stake_cpu_quantity: '1.0000 ' + process.env.TOKEN_NAME,
      transfer: false,
    }
  }];
  try {
    return await eosService.sendTx(actions, process.env.ACTOR_PRIVATE_KEY);
  } catch (e) {
    throw new Error(e);
  }
}

async function transferTo(to) {

}
module.exports = {
  deploy,
  createNewAccount
}