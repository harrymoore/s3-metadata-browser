# S3 Metadata Browser

A modern web application for browsing AWS S3 buckets and querying objects by their metadata. Built with Node.js backend and Vue.js frontend.

## Features

- **Bucket Browser**: View all accessible S3 buckets in your AWS account
- **Object Table View**: Display objects with comprehensive metadata columns including:
  - File name and size
  - Last modified date
  - Content type
  - Storage class
  - Custom metadata fields
- **Metadata Search**: Query and filter objects based on:
  - Content type
  - File size (min/max)
  - Storage class
  - Custom metadata key-value pairs
- **Modern UI**: Clean, responsive interface built with Tailwind CSS

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- AWS account with appropriate S3 permissions
- AWS credentials configured

## Installation

### 1. Clone and Install Backend Dependencies

```bash
cd s3-metadata-browser
npm install
```

### 2. Install Frontend Dependencies

```bash
cd client
npm install
```

### 3. Configure AWS Credentials

The application uses AWS default credential chain. Choose one of these methods:

**Option 1: AWS Credentials File (Recommended)**
```bash
# Configure AWS CLI (creates ~/.aws/credentials)
aws configure

# Or manually create ~/.aws/credentials:
[default]
aws_access_key_id = your_access_key_here
aws_secret_access_key = your_secret_key_here
region = us-east-1
```

**Option 2: Environment Variables**
Create a `.env` file in the root directory:
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
PORT=3000
NODE_ENV=development
```

**Option 3: IAM Roles** (if running on EC2/ECS/Lambda)
No additional configuration needed.

## Development

### Start the Backend Server

```bash
npm run dev
```

### Start the Frontend Development Server

```bash
npm run client
```

The application will be available at:
- Backend API: http://localhost:3000/api (IPv4) or http://[::1]:3000/api (IPv6)
- Frontend: http://localhost:9090 (IPv4) or http://[::1]:9090 (IPv6)

## Production Build

### 1. Build the Frontend

```bash
cd client
npm run build
```

### 2. Start the Production Server

```bash
npm start
```

The full application will be served at:
- IPv4: http://localhost:3000
- IPv6: http://[::1]:3000

## API Endpoints

### Buckets
- `GET /api/s3/buckets` - List all buckets

### Objects
- `GET /api/s3/buckets/:bucketName/objects` - List objects in bucket
- `GET /api/s3/buckets/:bucketName/objects-with-metadata` - List objects with metadata
- `GET /api/s3/buckets/:bucketName/objects/:key/metadata` - Get specific object metadata

### Search
- `POST /api/s3/buckets/:bucketName/search` - Search objects by metadata filters

## Usage

### Browsing Buckets
1. Navigate to the home page to see all available S3 buckets
2. Click on any bucket to view its contents

### Viewing Objects
- Objects are displayed in a table with metadata columns
- Each row shows file information and custom metadata tags
- Click refresh to reload the object list

### Searching by Metadata
1. Click "Search by Metadata" to open the search panel
2. Apply filters:
   - **Content Type**: Filter by MIME type (e.g., "image/jpeg")
   - **Size Range**: Set minimum and maximum file sizes in bytes
   - **Storage Class**: Filter by AWS storage class
   - **Custom Metadata**: Search using key=value format
3. Click "Search Objects" to apply filters
4. Use "Show All Objects" to clear search results

## AWS Permissions

The application requires the following AWS S3 permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListAllMyBuckets",
                "s3:ListBucket",
                "s3:GetObject",
                "s3:GetObjectAttributes"
            ],
            "Resource": [
                "arn:aws:s3:::*",
                "arn:aws:s3:::*/*"
            ]
        }
    ]
}
```

## Architecture

- **Backend**: Express.js server with AWS SDK for S3 operations (IPv4 and IPv6 support)
- **Frontend**: Vue.js 3 with Vue Router for SPA navigation (IPv4 and IPv6 support)  
- **Styling**: Tailwind CSS for responsive design
- **State Management**: Component-level state management
- **API Communication**: Axios for HTTP requests
- **Network**: Full dual-stack IPv4/IPv6 support for modern network environments

## Troubleshooting

### Common Issues

1. **AWS Credentials Error**: 
   - Ensure AWS credentials are configured (run `aws configure` or check `~/.aws/credentials`)
   - Verify your AWS user has S3 permissions
   - Check that the default profile has valid credentials
2. **CORS Issues**: The backend includes CORS middleware for development
3. **Large Buckets**: The app limits object fetching for performance (configurable)

### Performance Considerations

- Object metadata fetching is limited to 20 objects per request by default
- Search operations scan objects sequentially (consider pagination for large buckets)
- Custom metadata is cached during the session

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License