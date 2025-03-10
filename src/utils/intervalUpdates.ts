import { ethereum, BigInt } from '@graphprotocol/graph-ts'
import { VisrToken, VisrTokenDayData, UniswapV3HypervisorDayData, UniswapV3Hypervisor } from '../../generated/schema'
import { ZERO_BI, ZERO_BD } from './constants'

let SECONDS_IN_HOUR = BigInt.fromI32(60 * 60)
let SECONDS_IN_DAY = BigInt.fromI32(60 * 60 * 24)

export function updateVisrTokenDayData(event: ethereum.Event, utcDiffHours: BigInt): VisrTokenDayData {
    let timestamp = event.block.timestamp
    let utcDiffSeconds = utcDiffHours * SECONDS_IN_HOUR
    let timezone = (utcDiffHours == ZERO_BI) ? 'UTC' : "UTC" + utcDiffHours.toString() 

    let dayNumber = (timestamp + utcDiffSeconds) / SECONDS_IN_DAY
    let dayStartTimestamp = dayNumber * SECONDS_IN_DAY - utcDiffSeconds
    let dayId = timezone + '-' + dayNumber.toString()

    let visrDayData = VisrTokenDayData.load(dayId)
    if (visrDayData == null) {
        visrDayData = new VisrTokenDayData(dayId)
        visrDayData.date = dayStartTimestamp
        visrDayData.timezone = timezone
        visrDayData.distributed = ZERO_BI
        visrDayData.distributedUSD = ZERO_BD
    }

    let visr = VisrToken.load(event.address.toHexString())
    visrDayData.totalStaked = visr.totalStaked
    visrDayData.save()

    return visrDayData as VisrTokenDayData
}


export function updateUniswapV3HypervisorDayData(event: ethereum.Event): UniswapV3HypervisorDayData {
    let hypervisor = UniswapV3Hypervisor.load(event.address.toHexString())
    // hypervisorDayData.adjustedFeesReinvestedUSD = hypervisor.adjustedFeesReinvestedUSD

    let hypervisorDayDataUTC = getOrCreateHypervisorDayData(event, ZERO_BI)
    hypervisorDayDataUTC.tvl0 = hypervisor.tvl0
    hypervisorDayDataUTC.tvl1 = hypervisor.tvl1
    hypervisorDayDataUTC.tvlUSD = hypervisor.tvlUSD

    // let hypervisorDayDataEST = getOrCreateHypervisorDayData(event, -5)
    // hypervisorDayDataEST.tvl0 = hypervisor.tvl0
    // hypervisorDayDataEST.tvl1 = hypervisor.tvl1
    // hypervisorDayDataEST.tvlUSD = hypervisor.tvlUSD
    // hypervisorDayDataEST.save()

    return hypervisorDayDataUTC as UniswapV3HypervisorDayData
}


function getOrCreateHypervisorDayData(event: ethereum.Event, utcDiffHours: BigInt): UniswapV3HypervisorDayData {
    let timestamp = event.block.timestamp
    let utcDiffSeconds = utcDiffHours * SECONDS_IN_HOUR
    let timezone = (utcDiffHours == ZERO_BI) ? 'UTC' : "UTC" + utcDiffHours.toString() 

    let dayNumber = (timestamp + utcDiffSeconds) / SECONDS_IN_DAY
    let dayStartTimestamp = dayNumber * SECONDS_IN_DAY - utcDiffSeconds

    let dayHypervisorId = event.address.toHex() + '-' + timezone + '-' + dayNumber.toString()
    let hypervisorDayData = UniswapV3HypervisorDayData.load(dayHypervisorId)
    if (hypervisorDayData === null) {
        hypervisorDayData = new UniswapV3HypervisorDayData(dayHypervisorId)
        hypervisorDayData.date = dayStartTimestamp
        // hypervisorDayData.timezone = "UTC" + utcDiffHours.toString()
        hypervisorDayData.hypervisor = event.address.toHexString()
        hypervisorDayData.deposited0 = ZERO_BI
        hypervisorDayData.deposited1 = ZERO_BI
        hypervisorDayData.depositedUSD = ZERO_BD
        hypervisorDayData.withdrawn0 = ZERO_BI
        hypervisorDayData.withdrawn1 = ZERO_BI
        hypervisorDayData.withdrawnUSD = ZERO_BD
        hypervisorDayData.grossFeesClaimed0 = ZERO_BI
        hypervisorDayData.grossFeesClaimed1 = ZERO_BI
        hypervisorDayData.grossFeesClaimedUSD = ZERO_BD
        hypervisorDayData.protocolFeesCollected0 = ZERO_BI
        hypervisorDayData.protocolFeesCollected1 = ZERO_BI
        hypervisorDayData.protocolFeesCollectedUSD = ZERO_BD
        hypervisorDayData.feesReinvested0 = ZERO_BI
        hypervisorDayData.feesReinvested1 = ZERO_BI
        hypervisorDayData.feesReinvestedUSD = ZERO_BD
        hypervisorDayData.adjustedFeesReinvestedUSD = ZERO_BD
        hypervisorDayData.tvl0 = ZERO_BI
        hypervisorDayData.tvl1 = ZERO_BI
        hypervisorDayData.tvlUSD = ZERO_BD
    }

    return hypervisorDayData as UniswapV3HypervisorDayData
}