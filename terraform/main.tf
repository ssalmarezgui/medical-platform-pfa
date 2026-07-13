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
    ec2 = "http://127.0.0.1:4566"
  }
}

resource "aws_instance" "web_server" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  # Correction de CKV_AWS_126 : Activer la surveillance détaillée CloudWatch
  
  monitoring = true 

  # Correction de CKV_AWS_8 : Chiffrer le disque dur principal (Root Volume)

  root_block_device {
    encrypted = true
  }


  # Correction de CKV_AWS_79 : Forcer l'usage d'IMDSv2 (Désactive la V1 vulnérable)

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }

  tags = {
    Name = "Mon-Serveur-Web-AWS-Simule"
  }
}