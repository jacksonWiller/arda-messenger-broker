import { EventBridgeEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk';

const eventbridge = new AWS.EventBridge();
const s3 = new AWS.S3();

interface CustomEvent {
  resourceId: string;
  action: string;
  timestamp: string;
}

export const handler = async (event: EventBridgeEvent<string, CustomEvent>): Promise<APIGatewayProxyResult> => {
  try {

    console.log('Evento recebido:', event);

    // Enviar evento para EventBridge
    await eventbridge.putEvents({
      Entries: [{
        Source: 'custom.resource-manager',
        DetailType: 'ResourceCreated',
        EventBusName: `${process.env.SERVICE_NAME}-bus`,
        Detail: JSON.stringify({
          resourceId: event.detail.resourceId,
          action: event.detail.action,
          timestamp: new Date().toISOString()
        })
      }]
    }).promise();

    // Salvar no S3
    const timestamp = new Date().toISOString();
    await s3.putObject({
      Bucket: `${process.env.SERVICE_NAME}-events`,
      Key: `events/${timestamp}.json`,
      Body: JSON.stringify(event),
      ContentType: 'application/json'
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Evento processado com sucesso',
        eventId: event.id
      })
    };

  } catch (error) {
    console.error('Erro ao processar evento:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Erro ao processar evento',
        error: error.message 
      })
    };
  }
};
