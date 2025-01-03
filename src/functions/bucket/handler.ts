import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import aws from 'aws-sdk';
const { S3 } = aws;

const s3Client = new S3({ 
  region: 'ap-south-1',
  credentials: new aws.SharedIniFileCredentials({ profile: 'default' })
});

interface CreateBucketRequest {
  bucketName: string;
  tags?: { [key: string]: string };
}

export const createBucket = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const request: CreateBucketRequest = JSON.parse(event.body || '{}');
    const { bucketName, tags } = request;
    
    console.log('Request:', { bucketName, tags });

    console.log('Validação do nome do bucket');

    if (!bucketName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Bucket name is required' })
      };
    }

    console.log('Validação do formato do nome do bucket');
    
    if (!isValidBucketName(bucketName)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          message: 'Invalid bucket name. Bucket names must be between 3 and 63 characters long and can contain only lowercase letters, numbers, dots, and hyphens.'
        })
      };
    }

    console.log('Verifica se o bucket já existe');
    const exists = await s3Client.headBucket({ Bucket: bucketName }).promise()
      .then(() => true)
      .catch(() => false);

    if (exists) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: `Bucket ${bucketName} already exists` })
      };
    }

    console.log('Criar o bucket (sem LocationConstraint para us-east-1)');
    await s3Client.createBucket({ 
      Bucket: bucketName,
    }).promise();
    
    if (tags && Object.keys(tags).length > 0) {
      await s3Client.putBucketTagging({
        Bucket: bucketName,
        Tagging: {
          TagSet: Object.entries(tags).map(([Key, Value]) => ({ Key, Value }))
        }
      }).promise();
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: `Bucket ${bucketName} created successfully`,
        tags: tags || {}
      })
    };
  } catch (error) {
    console.error('Error creating bucket:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Error creating bucket', 
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

function isValidBucketName(name: string): boolean {
  const regex = /^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/;
  return regex.test(name) && !name.includes('..') && !name.includes('.-') && !name.includes('-.');
}

// List all buckets
export const getAllBuckets = async (): Promise<APIGatewayProxyResult> => {
  try {
    const data = await s3Client.listBuckets().promise();
    const buckets = data.Buckets?.map(bucket => bucket.Name) || [];
    
    return {
      statusCode: 200,
      body: JSON.stringify(buckets)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error listing buckets', error })
    };
  }
};

// Delete bucket
export const deleteBucket = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const bucketName = event.queryStringParameters?.bucketName;
    
    if (!bucketName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Bucket name is required' })
      };
    }

    await s3Client.deleteBucket({ Bucket: bucketName }).promise();
    
    return {
      statusCode: 204,
      body: ''
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error deleting bucket', error })
    };
  }
};
