import axios from "axios";
import Web3 from "web3";
import nconf from "nconf";

const web3 = new Web3(nconf.get("RPC_URL"));

const main = async () => {
  const apiUrl = "https://aggregator-api.kyberswap.com/bsc/api/v1/";
  const tokenIn = "0x55d398326f99059fF775485246999027B3197955"; //usdc
  const tokenOut = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d"; //usdt
  const amountIn = "1000000000000000000";

  // Construct the URL with query parameters
  const swapRouteUrl = `${apiUrl}routes?tokenIn=${tokenIn}&tokenOut=${tokenOut}&amountIn=${amountIn}`;
  const swapRouteData = await axios.get(swapRouteUrl);

  console.log(swapRouteData.data.data.routeSummary);

  const swapSignatureUrl = `${apiUrl}route/build`;
  const body = {
    routeSummary: swapRouteData.data.data.routeSummary,
    deadline: 0,
    slippageTolerance: 100,
    sender: "0x84327eD014908C3100A11F98b4Ec171557fA5F07",
    recipient: "0x84327eD014908C3100A11F98b4Ec171557fA5F07",
    source: "mahadao",
  };
  const swapSignature = await axios.post(swapSignatureUrl, body);

  // Replace these with your actual values
  const privateKey = nconf.get("PRIVATE_KEY");
  const fromAddress = "0x84327eD014908C3100A11F98b4Ec171557fA5F07"; // The address corresponding to the private key
  const toAddress = "0x6131B5fae19EA4f9D964eAc0408E4408b66337b5";

  const value = 0;
  const data = swapSignature.data.data.data;

  const gasPrice = await web3.eth.getGasPrice();
  const nonce = await web3.eth.getTransactionCount(fromAddress);

  const gasEstimate = await web3.eth.estimateGas({
    from: fromAddress,
    to: toAddress,
    value: value,
    data: data,
  });

  const gasLimit = Math.max(Number(gasEstimate) * 2, 44676);
  const transaction = {
    from: fromAddress,
    to: toAddress,
    value: value,
    gasLimit: web3.utils.toHex(gasLimit), // Increased gas limit
    gasPrice: gasPrice, // Example gas price
    nonce: nonce,
    data: data,
  };

  const signedTx = await web3.eth.accounts.signTransaction(
    transaction,
    privateKey
  );

  // Send the raw transaction
  const transactionResponse = await web3.eth.sendSignedTransaction(
    signedTx.rawTransaction
  );

  console.log("Transaction sent:", transactionResponse.transactionHash);
};

main();
