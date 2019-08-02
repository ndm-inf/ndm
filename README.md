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

    XRP:rw2htZCsyJk8yNRYDxjiv9QFiZ2yqCQCPJ

    XMR:47Nye79bFFea5Crez8xS7zjjjwBTYbSBD9mxDLfBcNPSXejx8MXxRgy545GNVEGu2HbSTyfJhHfcod9VcXXiZcYw7x3x6se

    BTC:bc1q9nfy6f6t5rmd0pz0k4ygrycq7g2h5k5gg3a58k

    ETH:0x4620b95421Fb2e04c203A7b7c836eC5C6C74fdC6

    LTC:LgiG6nz4Q7zuYdT6Z2KC6BWevRGMXqDbfP
