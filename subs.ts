import { configDotenv } from "dotenv";
import bs58 from 'bs58'
configDotenv()
import Client, { SubscribeRequest, CommitmentLevel } from "@triton-one/yellowstone-grpc";
// import {Co}

const token:string = process.env.token!;
const endpoint:string = process.env.endpoint!;
console.log(token,endpoint)
const client = new Client(endpoint, token, { "grpc.max_receive_message_length": 8 * 1024 * 1024,
 });

async function test() {
  // Create a subscription stream.
  const stream = await client.subscribe();

  // Collecting all incoming events.
  stream.on("data", (data) => {
    if (data.transaction && data.transaction.transaction && data.transaction.transaction.signature){
        console.log(bs58.encode(data.transaction.transaction.signature))
        console.log(Number((Date.now()/1000).toFixed(1)))
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