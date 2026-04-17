import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// =====================
// CONFIG
// =====================
const config = new pulumi.Config("project");

const dbName = config.require("dbName");
const dbUser = config.require("dbUser");
const dbPassword = config.requireSecret("dbPassword");
const sshKey = config.require("sshPublicKey");

// =====================
// VPC
// =====================
const vpc = new aws.ec2.Vpc("vpc", {
  cidrBlock: "10.0.0.0/16",
  enableDnsHostnames: true,
  enableDnsSupport: true,
});

const publicSubnet1 = new aws.ec2.Subnet("public-subnet-1", {
  vpcId: vpc.id,
  cidrBlock: "10.0.3.0/24",
  availabilityZone: "us-east-1a",
  mapPublicIpOnLaunch: true,
});

const publicSubnet2 = new aws.ec2.Subnet("public-subnet-2", {
  vpcId: vpc.id,
  cidrBlock: "10.0.4.0/24",
  availabilityZone: "us-east-1b",
  mapPublicIpOnLaunch: true,
});

const privateSubnet1 = new aws.ec2.Subnet("private-subnet-1", {
  vpcId: vpc.id,
  cidrBlock: "10.0.11.0/24",
  availabilityZone: "us-east-1a",
});

const privateSubnet2 = new aws.ec2.Subnet("private-subnet-2", {
  vpcId: vpc.id,
  cidrBlock: "10.0.12.0/24",
  availabilityZone: "us-east-1b",
});

// Internet Gateway
const igw = new aws.ec2.InternetGateway("igw", {
  vpcId: vpc.id,
});

// Route table for public subnets
const routeTable = new aws.ec2.RouteTable("route-table", {
  vpcId: vpc.id,
  routes: [
    {
      cidrBlock: "0.0.0.0/0",
      gatewayId: igw.id,
    },
  ],
});

new aws.ec2.RouteTableAssociation("rta-public-1", {
  subnetId: publicSubnet1.id,
  routeTableId: routeTable.id,
});

new aws.ec2.RouteTableAssociation("rta-public-2", {
  subnetId: publicSubnet2.id,
  routeTableId: routeTable.id,
});

// =====================
// SECURITY GROUPS
// =====================
const ec2Sg = new aws.ec2.SecurityGroup("ec2-sg", {
  vpcId: vpc.id,
  ingress: [
    { protocol: "tcp", fromPort: 22, toPort: 22, cidrBlocks: ["0.0.0.0/0"] },
    { protocol: "tcp", fromPort: 5000, toPort: 5000, cidrBlocks: ["0.0.0.0/0"] },
  ],
  egress: [
    { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
  ],
});

const rdsSg = new aws.ec2.SecurityGroup("rds-sg", {
  vpcId: vpc.id,
  ingress: [
    {
      protocol: "tcp",
      fromPort: 5432,
      toPort: 5432,
      securityGroups: [ec2Sg.id],
    },
  ],
});

// =====================
// S3 FRONTEND
// =====================
const bucket = new aws.s3.Bucket("frontend-bucket");

// =====================
// RDS DATABASE
// =====================
const subnetGroup = new aws.rds.SubnetGroup("db-subnet-group", {
  subnetIds: [privateSubnet1.id, privateSubnet2.id],
});

const db = new aws.rds.Instance("db", {
  engine: "postgres",
  instanceClass: "db.t3.micro",
  allocatedStorage: 20,
  dbName: dbName,
  username: dbUser,
  password: dbPassword,
  dbSubnetGroupName: subnetGroup.name,
  vpcSecurityGroupIds: [rdsSg.id],
  publiclyAccessible: false,
  skipFinalSnapshot: true,
});

// =====================
// EC2 INSTANCE
// =====================
const keyPair = new aws.ec2.KeyPair("keypair", {
  publicKey: sshKey,
});

const ami = aws.ec2.getAmi({
  mostRecent: true,
  owners: ["amazon"],
  filters: [
    {
      name: "name",
      values: ["al2023-ami-*-x86_64"],
    },
  ],
});

const server = new aws.ec2.Instance("server", {
  instanceType: "t3.micro",
  vpcSecurityGroupIds: [ec2Sg.id],
  subnetId: publicSubnet1.id,
  keyName: keyPair.keyName,
  ami: ami.then(a => a.id),
});

// =====================
// EXPORTS
// =====================
export const bucketName = bucket.bucket;
export const ec2PublicIp = server.publicIp;
export const dbEndpoint = db.endpoint;