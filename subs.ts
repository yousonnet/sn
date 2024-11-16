import { configDotenv } from "dotenv";
import bs58 from 'bs58'
configDotenv()
import Client, { SubscribeRequest, CommitmentLevel } from "@triton-one/yellowstone-grpc";
import { parseTransactionData ,calculateVirtualReserve,buyPF,calculateCreatorSolCost} from "./utils";
// import {Co}

const token:string = process.env.token!;
const endpoint:string = process.env.endpoint!;
console.log(token,endpoint)
const client = new Client(endpoint, token, { "grpc.max_receive_message_length": 64 * 1024 * 1024,
 });

async function test() {
  // Create a subscription stream.
  const stream = await client.subscribe();

  // Collecting all incoming events.
  stream.on("data", async(data) => {
    try{
    if (data.transaction && data.transaction.transaction ){
        let tx_data = data.transaction.transaction
        // console.log(data)
        // console.log(Number((Date.now()/1000).toFixed(1)))
        const block_hash = bs58.encode(tx_data.transaction.message.recentBlockhash)
        // console.log(tx_data.meta.innerInstructions)
        
        console.log(bs58.encode(tx_data.signature))
    
        // console.log('instructions',tx_data.transaction.message.instructions)
        // console.log(tx_data.meta.postTokenBalances)
        // const account_keys = (tx_data.transaction.message.accountKeys as Uint8Array[] || []).map((i)=>bs58.encode(i))
        // console.log(account_keys)
        // for (let i =0;i<10;i++){
        //     if (i==1 || i==3 ||i==4){
        //         console.log(account_keys[i])
        //     }
        // }
        // console.log(account_keys.length)
        const bond_info = parseTransactionData(tx_data)
        const {virtualsolreserve,virtualtokenreserve} = calculateVirtualReserve(bond_info!.creator_reserve,bond_info!.total_supply)
        // const {virtualsolreserve,virtualtokenreserve} = calculateVirtualReserve(bond_info!.creator_reserve,bond_info!.total_supply)
        console.log(bond_info!.bonding_curve,bond_info!.mint,0.125,1.15,0.00,0.002,bond_info!.associated_bonding_curve,virtualtokenreserve,virtualsolreserve,block_hash,bond_info!.total_supply)
        // const amount 
        const result = await buyPF(bond_info!.bonding_curve,bond_info!.mint,0.125,1.15,0.00,0.002,bond_info!.associated_bonding_curve,virtualtokenreserve,virtualsolreserve,block_hash,bond_info!.total_supply)
        console.log(result)
    }}catch{
        console.log(data)
    }
        
  });

  // Create a subscription request.
//   const request: SubscribeRequest = {
//     accounts: {},
//     slots: {},
//     transactions: {
//       tx: {
//         vote: false,
//         failed: false,
//         signature: undefined,
//         accountInclude: ["6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"], // pump
//         accountExclude: [],
//         accountRequired: [],
//       },
//       // Set a valid value for transactionsStatus or remove it if not needed
//     //   transactionsStatus: true, // Assuming it's a boolean or provide a valid value based on your API
//     },
//     blocks: {},
//     blocksMeta: {},
//     entry: {},
//     commitment: CommitmentLevel.PROCESSED,
//     accountsDataSlice: [],
//     ping: undefined,
//   };
  const request:SubscribeRequest = {
    "slots": {},
    "accounts": {},
    "transactions": {
        "alltxs":{"accountInclude":["HWEoBxYs7ssKuudEjzjmpfJVX7Dvi7wescFsVx2L5yoY",
"3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT",
"DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL",
"ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt",
"DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh",
"ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49",
"Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY",
"HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe",
"96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5"],'accountExclude':[],'accountRequired':["6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P","metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s","TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"]}
    },
    "blocks": {
    //   "blocks": {
    //     // "accountInclude": 
    //   }
    },
    "blocksMeta": {},
    "accountsDataSlice": [],
    commitment:CommitmentLevel.PROCESSED,
    transactionsStatus:{},
    entry:{}
  };

  // Sending a subscription request.
  await new Promise<void>((resolve, reject) => {
    stream.write(request, (err:any) => {
      if (err === null || err === undefined) {
        resolve();
      } else {
        reject(err);
      }
    });
  }).catch((reason) => {
    console.error(reason);
    throw reason;
  });
}

test();