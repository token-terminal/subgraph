import { Address, BigInt } from '@graphprotocol/graph-ts'
import { ERC20 } from "../../generated/UniswapV3HypervisorFactory/ERC20"
import { ERC20SymbolBytes } from '../../generated/UniswapV3HypervisorFactory/ERC20SymbolBytes'
import { ERC20NameBytes } from '../../generated/UniswapV3HypervisorFactory/ERC20NameBytes'
import { StaticTokenDefinition } from './staticTokenDefinition'
import { Token, StakedToken, RewardedToken } from "../../generated/schema"
import { ZERO_BI, WETH_ADDRESS, DEFAULT_DECIMAL } from "./constants"


export function fetchTokenSymbol(tokenAddress: Address): string {
  let contract = ERC20.bind(tokenAddress)
  let contractSymbolBytes = ERC20SymbolBytes.bind(tokenAddress)

  // try types string and bytes32 for symbol
  let symbolValue = 'unknown'
  let symbolResult = contract.try_symbol()
  if (symbolResult.reverted) {
    let symbolResultBytes = contractSymbolBytes.try_symbol()
    if (!symbolResultBytes.reverted) {
      // for broken pairs that have no symbol function exposed
      if (!isNullEthValue(symbolResultBytes.value.toHexString())) {
        symbolValue = symbolResultBytes.value.toString()
      } else {
        // try with the static definition
        let staticTokenDefinition = StaticTokenDefinition.fromAddress(tokenAddress)
        if(staticTokenDefinition != null) {
          symbolValue = staticTokenDefinition.symbol
        }
      }
    }
  } else {
    symbolValue = symbolResult.value
  }

  return symbolValue
}

export function fetchTokenName(tokenAddress: Address): string {
  let contract = ERC20.bind(tokenAddress)
  let contractNameBytes = ERC20NameBytes.bind(tokenAddress)

  // try types string and bytes32 for name
  let nameValue = 'unknown'
  let nameResult = contract.try_name()
  if (nameResult.reverted) {
    let nameResultBytes = contractNameBytes.try_name()
    if (!nameResultBytes.reverted) {
      // for broken exchanges that have no name function exposed
      if (!isNullEthValue(nameResultBytes.value.toHexString())) {
        nameValue = nameResultBytes.value.toString()
      } else {
        // try with the static definition
        let staticTokenDefinition = StaticTokenDefinition.fromAddress(tokenAddress)
        if(staticTokenDefinition != null) {
          nameValue = staticTokenDefinition.name
        }
      }
    }
  } else {
    nameValue = nameResult.value
  }

  return nameValue
}

export function fetchTokenDecimals(tokenAddress: Address): i32 {
  let contract = ERC20.bind(tokenAddress)
  // try types uint8 for decimals
  let decimalValue = DEFAULT_DECIMAL
  let decimalResult = contract.try_decimals()
  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value
  } else {
    // try with the static definition
    let staticTokenDefinition = StaticTokenDefinition.fromAddress(tokenAddress)
    if(staticTokenDefinition != null) {
      return staticTokenDefinition.decimals
    }
  }

  return decimalValue as i32
}

export function createToken(tokenAddress: Address): Token {

  let token = new Token(tokenAddress.toHex())
  let contract = ERC20.bind(tokenAddress)
  
  token.symbol = fetchTokenSymbol(tokenAddress)
  token.name = fetchTokenName(tokenAddress)
  token.decimals = fetchTokenDecimals(tokenAddress)

  return token
}

export function createStakedToken(vaultAddress: Address, tokenAddress: Address): StakedToken {

  let token = Token.load(tokenAddress.toHexString())
  if (token == null) {
    token = createToken(tokenAddress)
    token.save()
  }

  let stakedTokenId = vaultAddress.toHexString() + "-" + tokenAddress.toHexString() 
  let stakedToken = new StakedToken(stakedTokenId)
  stakedToken.token = tokenAddress.toHexString()
  stakedToken.visor = vaultAddress.toHexString()
  stakedToken.amount = ZERO_BI

  return stakedToken
}

export function createRewardedToken(vaultAddress: Address, tokenAddress: Address): RewardedToken {

  let token = Token.load(tokenAddress.toHexString())
  if (token == null) {
    token = createToken(tokenAddress)
    token.save()
  }

  let rewardedTokenId = vaultAddress.toHexString() + "-" + tokenAddress.toHexString() 
  let rewardedToken = new RewardedToken(rewardedTokenId)
  rewardedToken.token = tokenAddress.toHexString()
  rewardedToken.visor = vaultAddress.toHexString()
  rewardedToken.amount = ZERO_BI

  return rewardedToken
}

export function isWETH(tokenAddress: Address): boolean {

  if (tokenAddress == Address.fromString(WETH_ADDRESS)){
    return true
  } else {
    return false
  }
}

export function isNullEthValue(value: string): boolean {
  return value == '0x0000000000000000000000000000000000000000000000000000000000000001'
}