provider "aws" {
  region = var.aws_region
}

# 1. VPC Networking for SOC2/ISO Compliance
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  
  name = "amdox-erp-vpc"
  cidr = "10.0.0.0/16"
  
  azs             = ["us-east-1a", "us-east-1b", "us-east-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
  
  enable_nat_gateway = true
  single_nat_gateway = false
  
  tags = {
    Environment = "production"
    Suite       = "Amdox ERP"
  }
}

# 2. Managed PostgreSQL 17 (RDS)
resource "aws_db_instance" "postgres" {
  allocated_storage    = 100
  engine               = "postgres"
  engine_version       = "17.0"
  instance_class       = "db.r6g.large"
  name                 = "amdox_erp_db"
  username             = var.db_username
  password             = var.db_password
  parameter_group_name = "default.postgres17"
  skip_final_snapshot  = true
  multi_az             = true
  storage_encrypted    = true
}

# 3. Redis 8 (ElastiCache)
resource "aws_elasticache_replication_group" "redis" {
  replication_group_id          = "amdox-erp-redis"
  replication_group_description = "Redis for session and job queues"
  node_type                     = "cache.t4g.small"
  number_cache_clusters         = 2
  parameter_group_name          = "default.redis8.0"
  port                          = 6379
  automatic_failover_enabled    = true
}

# 4. EKS Cluster (Kubernetes 1.31)
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "amdox-erp-cluster"
  cluster_version = "1.31"

  vpc_id                   = module.vpc.vpc_id
  subnet_ids               = module.vpc.private_subnets
  control_plane_subnet_ids = module.vpc.public_subnets

  eks_managed_node_groups = {
    prod = {
      min_size     = 3
      max_size     = 10
      desired_size = 3
      instance_types = ["m6i.xlarge"]
    }
  }
}
