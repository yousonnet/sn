import { configDotenv } from "dotenv";
configDotenv();
import Client, { SubscribeRequest, CommitmentLevel } from "@triton-one/yellowstone-grpc";

const token:string = process.env.token!;
const endpoint:string = process.env.endpoint!;

const client = new Client(endpoint, token, { "grpc.max_receive_message_length": 256 * 1024 * 1024 });

async function test() {
  // Create a subscription stream.
  const stream = await client.subscribe();

  // Collecting all incoming events.
  stream.on("data", (data) => {
    if (data.block && data.block.blockTime && data.block.blockTime.timestamp) {
        console.log("data", data.block.blockTime.timestamp);
        
        console.log('now', Number((Date.now() / 1000).toFixed(1)));
        // console.log(data)
    } else {
        // console.warn("Received data does not contain blockTime:", data);
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
    "transactions": {},
    "blocks": {
      "blocks": {
        "accountInclude": ["6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"]
      }
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