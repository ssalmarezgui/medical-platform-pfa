terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region                      = "us-east-1"
  access_key                  = "mock_key"
  secret_key                  = "mock_key"
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true

  endpoints {
    s3  = "http://127.0.0.1:4566"
    ec2 = "http://127.0.0.1:4566"
    iam = "http://127.0.0.1:4566"
  }
}

resource "aws_s3_bucket" "medical_bucket" {
  bucket = "pfa-medical-secure-bucket"

  tags = {
    Name        = "Mon-Seau-S3-AWS-Simule"
    Environment = "Dev"
  }
}

resource "aws_instance" "web_server" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  ebs_optimized = true

  monitoring = true 

  iam_instance_profile = aws_iam_instance_profile.ec2_profile.name

  root_block_device {
    encrypted = true
  }

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }

  tags = {
    Name = "Mon-Serveur-Web-AWS-Simule"
  }
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "pfa-medical-ec2-profile"
  role = aws_iam_role.ec2_role.name
}

resource "aws_iam_role" "ec2_role" {
  name = "pfa-medical-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}