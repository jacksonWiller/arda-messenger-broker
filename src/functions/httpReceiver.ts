// src/functions/httpReceiver.ts
import { APIGatewayProxyHandler } from 'aws-lambda';
import AWS from 'aws-sdk';

const eventbridge = new AWS.EventBridge();
const s3 = new AWS.S3();

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { type, data } = body;

    await eventbridge.putEvents({
      Entries: [{
        EventBusName: process.env.EVENT_BUS_NAME,
        Source: 'message.broker',
        DetailType: type,
        Detail: JSON.stringify(data)
      }]
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Evento enviado com sucesso' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

// export const processEventOne = async (event: EventBridgeEvent<string, any>) => {
//   console.log('Processando Evento Um:', event);
//   // Lógica para processar o evento um
// };

// // src/functions/processEventTwo.ts  
// import { EventBridgeEvent } from 'aws-lambda';

// export const processEventTwo = async (event: EventBridgeEvent<string, any>) => {
//   console.log('Processando Evento Dois:', event);
//   // Lógica para processar o evento dois
// };
