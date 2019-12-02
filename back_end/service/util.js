function standardizedTx(tx) {
  return {
    id: tx.id,
    confirmations: new BigNumber(tx.last_irreversible_block).minus(tx.block_num),
  }
}

module.exports = {
  standardizedTx
}