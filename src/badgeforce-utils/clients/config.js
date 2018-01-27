import {ContractConfig} from 'badgeforcejs';
const holderArtifacts = require("badgeforce").holder;
const issuerArtifacts = require("badgeforce").issuer;
const issuerFactoryArtifacts = require('factories').issuerFactory;
const holderFactoryArtifacts = require('factories').holderFactory;

const ethereumNodeHost = "http://127.0.0.1:8000";
const accountIndex = 0;
const gas = 7500000;

export const holderClientConfig = new ContractConfig(ethereumNodeHost, holderArtifacts, accountIndex, gas);
export const issuerClientConfig = new ContractConfig(ethereumNodeHost, issuerArtifacts, accountIndex, gas);
export const issuerFactoryClientConfig = new ContractConfig(ethereumNodeHost, issuerFactoryArtifacts, accountIndex, gas);
export const holderFactoryClientConfig = new ContractConfig(ethereumNodeHost, holderFactoryArtifacts, accountIndex, gas);
