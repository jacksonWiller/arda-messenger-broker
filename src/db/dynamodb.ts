import * as AWS from 'aws-sdk';

const dynamoConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
};

if (process.env.IS_OFFLINE) {
  dynamoConfig['endpoint'] = 'http://localhost:8000';
}

export const dynamoDb = new AWS.DynamoDB.DocumentClient(dynamoConfig);
export const TableName = process.env.DYNAMODB_TABLE || 'Products';
