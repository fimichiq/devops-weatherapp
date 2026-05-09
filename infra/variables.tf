variable "region" {
  type        = string
  default     = "eu-central-1"
  description = "AWS region."
}

variable "project" {
  type        = string
  default     = "weather"
  description = "Short project prefix used in resource names."
}

variable "vpc_cidr" {
  type        = string
  default     = "10.0.0.0/16"
  description = "CIDR for the VPC."
}

variable "public_subnet_cidrs" {
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
  description = "CIDRs for the two public subnets."
}

variable "azs" {
  type        = list(string)
  default     = ["eu-central-1a", "eu-central-1b"]
  description = "Availability zones, must align with public_subnet_cidrs."
}

variable "backend_image_tag" {
  type        = string
  default     = "latest"
  description = "ECR image tag for the backend task definition."
}

variable "frontend_image_tag" {
  type        = string
  default     = "latest"
  description = "ECR image tag for the frontend task definition."
}

variable "log_retention_days" {
  type        = number
  default     = 14
  description = "CloudWatch log retention for ECS tasks."
}
