# Run IndImmUI Locally

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.2.2.
Clone this repo: https://github.com/ndm-inf/ndm.git
Install Angular CLI: npm install -g @angular/cli
Install Dependencies: npm install
Run Locally: ng serve
Navigate to `http://localhost:4200/`

## How does IndImm work

            Below is a quick summary on how IndImm works. More detailed high level and low/dev level documentation for the IndImmUI application and the IndImm Message Protocol (IMP) will be provided shortly. All sourcecode is available at https://github.com/ndm-inf/ndm where the master branch is what is currently deployed.

            The highlight/10,000 ft view of how IndImm works is that the IndImm Client utilizes the IndImm defined IndImm Message Protocol (IMP) operating on the Ripple block chain and takes any file and loads it into local memory in your browser with the IndImm client and attaches the file as a Base64 string to a ripple payment. When the payment is sent, the file data is attached directly to the payment and once confirmed on the ripple ledger across all decentralized ripple validators, it remains permanent on the ripple ledger and cannot be removed and changed and is therefore Indestructible and Immutable. 

            However, most files one would want to potentially store with IndImm will be much larger than what can be stored with a single ripple transaction and thus, IndImm chunks the file into small portions that each will fit into a single transaction and stores the file across multiple transactions which are chained together sequentially with pointers to each child transaction. Lastly, a root transaction is sent to ripple containing a reference to the transaction chain. To pull a file from the ripple blockchain, the root transaction is referenced and associated chained transactions chunks are pulled and recombined back into a single file. In addition to the file chain reference in the root transaction, additional text can be included with the file and is stored in a separate child transaction chain referenced by the root object.

## Donate
XRP:rJ383ZRZ1o4KCZKtDH2MDFehhaXKaiaDBu
XMR:495i5YirqevhLX8xi99cPwPTxKsLNTvr37mSUHxKrSZDe39oa8NRXMPah92GLNADxf9AwEo1Jf9WH1HhtxJ9HAgmNgbyCWS
BTC:1DMeF39xYzjo98EnmzJQ9yikGTYbTQi4hv
ETH:0x973d6f6810BfcF9b3C8D5CAD7cc3b22646459e9A
LTC:ltc1qd69dtysjlahcanw3464phq8pxqtwqcly5pjeum