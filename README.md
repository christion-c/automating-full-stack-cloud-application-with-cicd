# Cloud Computing Final Project

## Overview
This project deploys a full-stack cloud-native application to AWS using:
- React frontend hosted in S3
- Node.js/Express backend running in Docker on EC2
- PostgreSQL on Amazon RDS
- Infrastructure as Code with Pulumi
- CI/CD with GitHub Actions
- Monitoring with CloudWatch
-small change
## Architecture
Browser -> S3 static website -> Backend API on EC2 -> PostgreSQL on RDS

## AWS Resources
- VPC
- Public and private subnets
- Security groups
- EC2 instance
- RDS PostgreSQL instance
- S3 bucket
- CloudWatch alarms
- SNS topic

## Deployment Steps
1. Pulumi provisions AWS infrastructure.
2. Frontend is built and deployed to S3.
3. Backend Docker image is built and deployed to EC2.
4. Backend connects securely to RDS.

## Security
- SSH restricted to my IP
- RDS not publicly accessible
- RDS security group allows PostgreSQL only from EC2 security group
- Database password not stored in source control
- GitHub Actions uses OIDC for AWS authentication

## Monitoring
- CloudWatch agent installed on EC2
- CPU, memory, disk, and RDS alarms configured
- SNS email notifications enabled

## CI/CD
- GitHub Actions builds frontend and backend on push to main
- Frontend deploys to S3
- Backend image is copied to EC2 and restarted
- Health check verifies backend deployment

## Endpoints
- Frontend: http://frontend-bucket-0491bb9.s3-website-us-east-1.amazonaws.com
- Backend health: http://3.239.105.8:5000/api/health
- Backend data: http://3.239.105.8:5000/api/data