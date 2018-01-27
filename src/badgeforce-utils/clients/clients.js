import {HolderClient, IssuerClient, IssuerFactoryClient, HolderFactoryClient} from 'badgeforcejs';
import {holderClientConfig, issuerClientConfig, holderFactoryClientConfig, issuerFactoryClientConfig} from './config'

const holderClient = new HolderClient(holderClientConfig);
const issuerClient = new IssuerClient(issuerClientConfig);
const issuerFactoryClient = new IssuerFactoryClient(issuerFactoryClientConfig);
const holderFactoryClient = new HolderFactoryClient(holderFactoryClientConfig);

export const clients = {
  holder: holderClient,
  issuer: issuerClient,
  holderFactory: holderFactoryClient,
  issuerFactory: issuerFactoryClient
}
