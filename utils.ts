import {Decimal} from 'decimal.js'
import bs58 from 'bs58'
import axios from 'axios'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'

interface SocialDict {
    twitter?: string;
    telegram?: string;
    website?: string;
  }
  function calculateVirtualReserve(creator_buy_amount: string, total_supply: string, initial_pool_sol: string = '30') {
    // Convert inputs to Decimal for precision
    let initial_pool_sol_decimal = new Decimal(initial_pool_sol).times(LAMPORTS_PER_SOL);  // Initial pool SOL in lamports
    let total_supply_decimal = new Decimal(total_supply);  // Total token supply as a decimal
    let creator_buy_amount_decimal = new Decimal(creator_buy_amount);  // Creator's buy amount as a decimal

    // Calculate the current token reserve (now_token_reserve)
    let x = new Decimal('1.073000191').times(total_supply_decimal).minus(creator_buy_amount_decimal);

    // Calculate the virtual SOL reserve (virtual_sol_reserve)
    let k = new Decimal('32.19000573').times(total_supply_decimal)
    let y = k.div(x)

    // let sol_buy_amount_decimal =creator_buy_amount_decimal.div(virtual_sol_lamp_buy_ratio)
    // Return rounded values as strings
    return {
        virtualsolreserve: y.times(LAMPORTS_PER_SOL).round().toString(),
        virtualtokenreserve: x.round().toString()
    };
}
// Constants
const INITIAL_PRICE_DIVIDER = new Decimal('1');  // Adjust this based on your actual bonding curve configuration


function calculateCreatorSolCost(
    creator_BuyAmount_Decimal: string,
    total_Supply_Decimal: string,
    initialPoolSol: Decimal = new Decimal('30')
): Decimal {
    let totalSupplyDecimal = new Decimal(total_Supply_Decimal)
    let creatorBuyAmountDecimal = new Decimal(creator_BuyAmount_Decimal)
    // Step 1: Calculate T_b (the number of tokens after purchase)
    let Tb = totalSupplyDecimal.plus(creatorBuyAmountDecimal);

    // Step 2: Calculate S_b (the total SOL cost for Tb tokens)
    let Sb = Tb.plus(1).times(Tb).div(2).times(INITIAL_PRICE_DIVIDER);

    // Step 3: Calculate S_a (the total SOL cost for Ta tokens, where Ta is before purchase)
    let Sa = totalSupplyDecimal.plus(1).times(totalSupplyDecimal).div(2).times(INITIAL_PRICE_DIVIDER);

    // Step 4: Calculate the difference in SOL (S_b - S_a), which gives us the actual cost
    let solCost = Sb.minus(Sa);

    return solCost;
}

async function buyPF(bonding_curve: string, mint: string, amount: number, slippage: number, priorityFee: number, jitoTip: number, vault: string, virtual_token_reserve: string, virtual_sol_reserve: string, block_hash: string,total_supply:string) {
    try {
        // 构建请求数据
        const requestData = {
            amount,
            contract: mint, // 假设 mint 是合约地址
            slippage,
            priorityFee,
            jitoTip,
            sell: false, // 根据你的逻辑设置
            is_percent: false, // 根据你的逻辑设置
            bonding_curve,
            vault,
            virtual_token_reserve,
            virtual_sol_reserve,
            block_hash,
            total_supply
        };

        // 发送 POST 请求到 /buy 路由
        const response = await axios.post('http://localhost:43332/buy', requestData);

        // 返回响应结果
        return response.data;
    } catch (error) {
        console.error("Error while buying token:", error);
        throw error; // 重新抛出错误以便调用者处理
    }
}

function parseTransactionData(transaction_data: any): {
    mint: string;
    usd_market_cap: number;
    twitter: string;
    website: string;
    telegram: string;
    creator: string;
    total_supply: string;
    creator_reserve: string;
    bonding_curve: string;
    associated_bonding_curve: string;
  }|null {
    

    // // Extract IPFS data from inner instructions
    // let ipfs_bs58 = '';
    // for (const x of transaction_data.result.meta.innerInstructions) {
    //   if ('instructions' in x && x.instructions.length === 15) {
    //     ipfs_bs58 = x.instructions[8]?.data || '';
    //     break;
    //   }
    // }
    // const instructions = (transaction_data.transaction.message.instructions as Uint8Array[] || []).map((i)=>{return {accounts:bs58.encode(i)}})
    // console.log(instructions)
    const account_keys = (transaction_data.transaction.message.accountKeys as Uint8Array[] || []).map((i)=>bs58.encode(i))
    // Calculate total supply
    const post_token_balance:any[] = transaction_data.meta.postTokenBalances|| [];
    if (account_keys.length ==0  ||post_token_balance.length==0){
        return null
    }
    // console.log(post_token_balance)
    const total_supply = (post_token_balance.reduce((sum:Decimal, x:any) => sum.add(x.uiTokenAmount.amount), new Decimal(0))).round().toString();

    // // Extract instruction accounts
    // let instruction3_accounts = [];
    
    // for (const x of instructions) {
    //   if ('accounts' in x && x.accounts.length === 14) {
    //     instruction3_accounts = x.accounts;
    //     break;
    //   }
    // }

    const creator = account_keys[0]
    const mint = account_keys[1]
    const bonding_curve = account_keys[3];
    const vault = account_keys[4];
    const creator_hold_amount = post_token_balance.filter(x=>(x.owner == creator && x.mint==mint))
    const creator_hold = creator_hold_amount.reduce((sum:Decimal, x:any) => sum.add(x.uiTokenAmount.amount), new Decimal(0)).toString();
    // Placeholder for IPFS-based social data
    const social_dict: SocialDict = {}; // You can replace this with actual IPFS fetching logic
    
    const twitter = social_dict.twitter || '';
    const telegram = social_dict.telegram || '';
    const website = social_dict.website || '';
  
    // Market cap and token reserves
    const mc = 5000; // Placeholder value for market cap
    return {
      mint,
      usd_market_cap: mc,
      twitter,
      website,
      telegram,
      creator,
      total_supply,
      creator_reserve:creator_hold,
      bonding_curve,
      associated_bonding_curve: vault,
    };
  }

  export{parseTransactionData,calculateVirtualReserve,buyPF,calculateCreatorSolCost}