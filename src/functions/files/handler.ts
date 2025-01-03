import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import aws from 'aws-sdk';

const s3 = new aws.S3();
const BUCKET_NAME = process.env.IMAGE_BUCKET || 'seu-bucket-de-imagens';

export const uploadImage = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { fileName, fileContent } = JSON.parse(event.body || '{}');

    const params = {
      Bucket: 'catalog-images54361234532',
      Key: fileName,
      Body: Buffer.from(fileContent, 'base64'),
      ContentEncoding: 'base64',
      ContentType: fileContent.mimetype,
    };

    await s3.putObject(params).promise();

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Imagem enviada com sucesso' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

export const getImage = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const key = 'teste2.png';

    if (!key) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Chave da imagem é obrigatória' }),
      };
    }

    const params = {
      Bucket: 'catalog-images54361234532',
      Key: 'teste2.png',
    };

    console.log(params);

    const data = await s3.getObject(params).promise();

    console.log(data);

    return {
      statusCode: 200,
      body: data.Body?.toString('base64'),
      isBase64Encoded: true,
      headers: {
        'Content-Type': data.ContentType || 'image/jpeg',
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

export const listImages = async (): Promise<APIGatewayProxyResult> => {
  try {
    const params = {
      Bucket: BUCKET_NAME,
    };

    const data = await s3.listObjectsV2(params).promise();

    const imageKeys = data.Contents?.map(item => item.Key) || [];

    return {
      statusCode: 200,
      body: JSON.stringify({ images: imageKeys }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

export const deleteImage = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const key = event.pathParameters?.key;

    if (!key) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Chave da imagem é obrigatória' }),
      };
    }

    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    await s3.deleteObject(params).promise();

    return {
      statusCode: 204,
      body: '',
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
